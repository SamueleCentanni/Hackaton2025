import { Form, Button, Alert, Spinner, Row, Col, Card } from "react-bootstrap";

import React, { useState } from 'react';
import {useNavigate} from "react-router";

function MyUploadingFormFile(props) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null); // To store the selected file
    const [loading, setLoading] = useState(false);  // To manage loading state
    const [error, setError] = useState(null);       // To manage error state
    const [success, setSuccess] = useState(false);  // To manage success state

    // Handle file change and update state
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null); // Clear error when a new file is selected
            setSuccess(false); // Clear success message when a new file is selected
        }
    };

    // Trigger hidden file input click
    const handleButtonClick = () => {
        document.getElementById("fileInput").click();
    };

    // Submit the file for upload
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true); // Set loading to true when the upload starts
        setError(null);   // Reset any previous errors
        setSuccess(false); // Reset success state

        try {
            const response = await fetch("http://192.168.1.3:8000/maps/upload/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("File upload failed");
            }

            const responseData = await response.json();
            console.log(responseData);
            setSuccess(true);
            setFile(null); // Reset file after successful upload

            // Navigate to the homepage after successful upload
            navigate('/');

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false); // Reset loading state after upload
        }
    };

    return (
        <Row className="justify-content-center my-4">
            <Col xs="auto" className="text-center">
                {/* Hidden file input */}
                <input
                    type="file"
                    id="fileInput"
                    accept=".pdf"  // Only allow PDF files
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {/* Upload Button */}
                <Row className="mb-4 justify-content-center">
                    <Button
                        variant="primary"
                        onClick={handleButtonClick}
                        disabled={loading}
                        className="btn-lg d-flex align-items-center px-5 py-3"
                        style={{
                            borderRadius: '50px',
                            boxShadow: loading ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'box-shadow 0.3s ease'
                        }}
                    >
                        <i className="bi bi-file-earmark-plus" style={{ fontSize: '1.5rem' }} />
                        <span className="ms-3">Upload PDF</span>
                    </Button>
                </Row>

                {/* Display Selected File */}
                {file && (
                    <Card className="mt-3 shadow-lg" style={{ maxWidth: '400px', margin: 'auto' }}>
                        <Card.Body>
                            <Card.Text><strong>Selected file:</strong> {file.name}</Card.Text>
                        </Card.Body>
                    </Card>
                )}

                {/* Submit Button */}
                {file ?
                <Row className="mt-3 justify-content-center">
                    <Button
                        variant="success"
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="btn-lg px-5 py-3"
                        style={{
                            borderRadius: '50px',
                            boxShadow: loading ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'box-shadow 0.3s ease'
                        }}
                    >
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </Row>
                    :
                    null
                }

                {/* Display Error or Success Message */}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                {success && <Alert variant="success" className="mt-3">File uploaded successfully!</Alert>}
            </Col>
        </Row>

    );
}



export { MyUploadingFormFile };

















function MyUploadingFormFolder(props) {
    const [files, setFiles] = useState([]); // Store multiple files
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState(null);       // Error state
    const [success, setSuccess] = useState(false);  // Success state

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length > 0) {
            // Filter for PDF files only
            const pdfFiles = Array.from(selectedFiles).filter(file => file.type === "application/pdf");
            if (pdfFiles.length > 0) {
                setFiles(pdfFiles);
                setError(null); // Reset error on new files
                setSuccess(false); // Reset success message
            } else {
                setError("Please select only PDF files.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (files.length === 0) {
            setError("Please select a folder with PDF files.");
            return;
        }

        const formData = new FormData();
        files.forEach(file => formData.append("files[]", file));  // Append each PDF file

        setLoading(true);
        setError(null);  // Reset error message
        setSuccess(false);  // Reset success state

        try {
            const response = await fetch("http://192.168.1.3:8000/maps/uploadfolder/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Folder upload failed");
            }

            const responseData = await response.json();  // Optionally handle any data returned from the server
            console.log(responseData);

            setSuccess(true);  // Mark as success
            setFiles([]); // Clear selected files after successful upload
        } catch (error) {
            setError(error.message);  // Show error if upload fails
        } finally {
            setLoading(false);  // Reset loading state
        }
    };

    return (
        <Row className="my-4 d-flex justify-content-center">
            <Col xs={12} sm={8} md={6} lg={4}>
                {/* File input for folder selection */}
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label className="d-flex align-items-center">
                        {/* Icon before the file input */}
                        <i className="bi bi-plus-circle me-2" style={{ fontSize: "1.5rem" }}></i>
                    </Form.Label>
                    <Form.Control
                        type="file"
                        webkitdirectory="true"  // Allow folder selection
                        multiple  // Allow multiple files
                        accept=".pdf"  // Only allow PDF files
                        onChange={handleFileChange}
                        style={{ display: "none" }}  // Hide default file input
                    />
                </Form.Group>

                {/* Upload button */}
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || files.length === 0}
                    className="w-100 mt-3"
                >
                    {loading ? <Spinner animation="border" size="sm" /> : "Upload PDFs"}
                </Button>

                {/* Show error or success messages */}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                {success && <Alert variant="success" className="mt-3">Folder uploaded successfully!</Alert>}

                {/* Show loading spinner if upload is in progress */}
                {loading && <Spinner animation="border" size="sm" className="mt-3" />}
            </Col>
        </Row>
    );
}

export { MyUploadingFormFolder };