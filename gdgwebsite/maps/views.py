import asyncio
import json
from time import sleep

import PyPDF2
from asgiref.sync import async_to_sync
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import fitz  # PyMuPDF
import io

from django.views.decorators.http import require_POST

from agents.agent import api_call_agent_async
from agents.myAgentAI_converted import api_topics_generator, api_quiz_generator
from .models import ROOT


def get_graph(request, map_id):
    try:
        # Fetch the ROOT object by map_id and return only 'name' and 'json_map'
        graph = ROOT.objects.filter(id=map_id).values('name', 'json_map').first()

        if not graph:
            return JsonResponse({'error': 'Graph not found'}, status=404)

        # The json_map should already have the structure with 'nodes' and 'links'
        return JsonResponse(graph)  # Return the 'name' and 'json_map' as JSON response

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def list_graphs(request):
    try:
        # Fetch all ROOT objects, but only return the 'name' field
        graphs = ROOT.objects.all().values('name', 'id')

        if not graphs:
            return JsonResponse({'error': 'No graphs found'}, status=404)

        # Return the list of graph names as a JSON response
        return JsonResponse(list(graphs), safe=False)  # Wrap the queryset in a list for JSON serialization

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def upload_pdf(request):
    if request.method == 'POST' and 'file' in request.FILES:
        # Get the uploaded file
        pdf_file = request.FILES['file']

        # Extract text from the PDF
        data = extract_pdf_text(pdf_file)

        # Asynchronously extract topics from the extracted text
        extracted_topics = asyncio.run(api_topics_generator(data))

        extracted_topics_cut = extracted_topics.removeprefix("```json\n").removesuffix("```\n")
        python_object = json.loads(extracted_topics_cut)

        # Assuming ROOT is a Django model for storing the extracted data
        ROOT.objects.create(name=pdf_file.name, json_map=python_object, pdf_file=pdf_file)

        return JsonResponse({'message': 'File uploaded successfully!', 'data': data}, status=200)

    return JsonResponse({'error': 'No file provided or incorrect request method'}, status=400)


def extract_pdf_text(pdf_file):
    # Convert the uploaded file to a byte stream
    pdf_data = io.BytesIO(pdf_file.read())

    # Open the PDF file using PyMuPDF (fitz)
    pdf_document = fitz.open(stream=pdf_data, filetype="pdf")

    # Initialize an empty string to store the extracted text
    pdf_text = ""

    # Loop through all pages of the PDF
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        pdf_text += page.get_text()

    return pdf_text


def qea(request, map_id):
    try:
        obj = ROOT.objects.filter(id=map_id).first()
        if not obj or not obj.pdf_file:
            return JsonResponse({'error': 'PDF file not found.'}, status=404)

        with obj.pdf_file.open('rb') as f:
            pdf_text = extract_pdf_text(f)

        qeas = asyncio.run(api_quiz_generator(pdf_text))

        extracted_topics_cut = qeas.removeprefix("```json\n").removesuffix("```\n")
        python_object = json.loads(extracted_topics_cut)

        return JsonResponse(python_object, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_POST
def uploadregistration(request):
    try:
        data = json.loads(request.body)
        profile_text = data.get('profileText', '')

        ans = asyncio.run(api_call_agent_async(profile_text))

        return HttpResponse(ans, content_type='text/plain', status=200)

    except json.JSONDecodeError:
        return HttpResponse("Invalid JSON format", status=400)
    except Exception as e:
        return HttpResponse(str(e), status=500)






# {
#     "nodes": [
#         {
#             "id": "root",
#             "name": "Root node",
#             "val": 1
#         },
#         {
#             "id": "Big Data Definition and Characteristics",
#             "name": "Defines Big Data as large, complex datasets unmanageable by traditional tools, highlighting the 3Vs: Volume, Velocity, and Variety.",
#             "val": 1
#         },
#         {
#             "id": "Data Management Pipeline",
#             "name": "Outlines the steps in data management: Acquisition, Cleaning & Extraction, Aggregation & Representation, Modeling, and Interpretation.",
#             "val": 1
#         },
#         {
#             "id": "Additional Data Management Aspects",
#             "name": "Discusses Heterogeneity, Privacy concerns, and the importance of clear data visualization in dataset management.",
#             "val": 1
#         },
#         {
#             "id": "Data Science Definition and Goal",
#             "name": "Defines Data Science as data analysis with the primary goal of generating profit.",
#             "val": 1
#         },
#         {
#             "id": "Responsibilities of Data Scientists",
#             "name": "Lists the tasks of data scientists, including customer behavior analysis, code quality verification, domain-specific problem-solving, and dataset preparation.",
#             "val": 1
#         }
#     ],
#     "links": [
#         {
#             "source": "root",
#             "target": "Big Data Definition and Characteristics"
#         },
#         {
#             "source": "root",
#             "target": "Data Management Pipeline"
#         },
#         {
#             "source": "root",
#             "target": "Additional Data Management Aspects"
#         },
#         {
#             "source": "root",
#             "target": "Data Science Definition and Goal"
#         },
#         {
#             "source": "root",
#             "target": "Responsibilities of Data Scientists"
#         }
#     ]
# }


@csrf_exempt
def uploadfolder_pdf(request):
    if request.method == 'POST' and request.FILES.getlist('files[]'):
        # Retrieve the files from the request
        files = request.FILES.getlist('files[]')

        # Initialize lists to store uploaded files and errors
        uploaded_files = []
        errors = []

        # Loop through each file and save it if it is a PDF
        for file in files:
            try:
                # Check if the file is a PDF based on its extension
                if not file.name.endswith('.pdf'):
                    raise ValueError(f"File {file.name} is not a PDF.")

                # Add successfully uploaded file to the list
                uploaded_files.append(file.name)

            except Exception as e:
                # Collect error messages for any failed uploads
                errors.append(f"Error uploading {file.name}: {str(e)}")

        # Return a response depending on whether there were errors or successful uploads
        if errors:
            return JsonResponse({'error': errors}, status=400)

        return JsonResponse({'message': 'Files uploaded successfully!', 'files': uploaded_files}, status=200)

    return JsonResponse({'error': 'No files provided or incorrect request method'}, status=400)
