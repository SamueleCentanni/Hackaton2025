import React, { useState } from 'react';
import { Button, Form, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import {useNavigate} from "react-router";

function MyLogin(props) {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');  // Changed to username
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please fill out both fields');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);


        // Simulating an API call
        setTimeout(() => {
            if (username === 'admin' && password === 'arancione') {  // Check for username instead of email
                setSuccess(true);
                setUsername('');
                setPassword('');
            } else {
                setError('Invalid username or password');
            }
            setLoading(false);
            navigate('/')
        }, 1500);
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center"
            style={{ height: '100vh', backgroundColor: '#565e64' }}
        >
            <Row className="justify-content-center w-100">
                <Col xs={12} sm={8} md={6} lg={4}>
                    <div
                        className="shadow-sm rounded p-4"
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            minHeight: '400px',
                            backgroundColor: '#343a40',
                            color: 'white', // Text color set to white for better contrast on dark background
                        }}
                    >
                        {/* Logo */}
                        <div className="text-center mb-4">
                            <img
                                src="/brn.png" // Path to your logo image
                                alt="Logo"
                                className="img-fluid"
                                style={{ maxWidth: '150px' }} // Optional styling to control the logo size
                            />
                        </div>

                        <h3 className="text-center mb-4">Welcome to Braynr</h3>

                        {/* Login Form */}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formUsername" className="mb-3">  {/* Changed formEmail to formUsername */}
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"  // Username type set to text
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formPassword" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {/* Feedback Messages */}
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            {success && <Alert variant="success" className="mt-3">Login successful!</Alert>}

                            {/* Submit Button */}
                            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export { MyLogin };