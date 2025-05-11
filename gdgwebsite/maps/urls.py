from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('<int:map_id>/', get_graph, name='get_map_by_id'),
    path('', list_graphs),
    path('upload/', upload_pdf),
    path('uploadfolder/', uploadfolder_pdf),
    path('qea/', qea),

]
