import React, { useState } from 'react';
import { Button, Form, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';

function MyRegister() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields
        if (!username || !password || !confirmPassword) {
            setError('Please fill out all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        // Simulated API call
        setTimeout(() => {
            if (username !== 'admin') {
                setSuccess(true);
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                navigate('/register/psychologicalPOV');
            } else {
                setError('This username is already taken');
            }
            setLoading(false);
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
                            minHeight: '450px',
                            backgroundColor: '#343a40',
                            color: 'white',
                        }}
                    >
                        <div className="text-center mb-4">
                            <img
                                src="/brn.png"
                                alt="Logo"
                                className="img-fluid"
                                style={{ maxWidth: '150px' }}
                            />
                        </div>

                        <h3 className="text-center mb-4">Create an Account</h3>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="registerUsername" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="registerPassword" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Choose a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="confirmPassword" className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            {success && <Alert variant="success" className="mt-3">Registration successful!</Alert>}

                            <Button variant="success" type="submit" className="w-100" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

function MyRegisterPOV() {
    const [personalityTraits, setPersonalityTraits] = useState('Creative, Analytical');
    const [mainGoals, setMainGoals] = useState('Become a successful software engineer');
    const [learningPreferences, setLearningPreferences] = useState('Hands-on, Project-based learning');
    const [motivationalDrivers, setMotivationalDrivers] = useState('Achieving personal growth, solving complex problems');
    const [areasOfInterest, setAreasOfInterest] = useState('Cybersecurity, AI, Data Science');
    const [communicationStyle, setCommunicationStyle] = useState('Clear, concise, prefers written communication');

    const [profile, setProfile] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Update the corresponding state variable based on the input name
        if (name === 'personalityTraits') setPersonalityTraits(value);
        if (name === 'mainGoals') setMainGoals(value);
        if (name === 'learningPreferences') setLearningPreferences(value);
        if (name === 'motivationalDrivers') setMotivationalDrivers(value);
        if (name === 'areasOfInterest') setAreasOfInterest(value);
        if (name === 'communicationStyle') setCommunicationStyle(value);
    };

    const generateProfile = () => {
        let profileSummary = '';

        // Concatenate each answer to the profile string
        profileSummary += `**Personality Traits**: ${personalityTraits}\n\n`;
        profileSummary += `**Main Goals**: ${mainGoals}\n\n`;
        profileSummary += `**Learning Preferences**: ${learningPreferences}\n\n`;
        profileSummary += `**Motivational Drivers**: ${motivationalDrivers}\n\n`;
        profileSummary += `**Areas of Interest**: ${areasOfInterest}\n\n`;
        profileSummary += `**Communication Style**: ${communicationStyle}\n\n`;

        setProfile(profileSummary);
    };

    return (
        <div className="container">
            <h2 className="mb-4">Personal Profile Questionnaire</h2>

            <Form>
                <Form.Group controlId="personalityTraits" className="mb-3">
                    <Form.Label>Personality Traits</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Describe your personality traits"
                        name="personalityTraits"
                        value={personalityTraits}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="mainGoals" className="mb-3">
                    <Form.Label>Main Goals</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Describe your main goals"
                        name="mainGoals"
                        value={mainGoals}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="learningPreferences" className="mb-3">
                    <Form.Label>Learning Preferences</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Describe your learning preferences"
                        name="learningPreferences"
                        value={learningPreferences}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="motivationalDrivers" className="mb-3">
                    <Form.Label>Motivational Drivers</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="What motivates you?"
                        name="motivationalDrivers"
                        value={motivationalDrivers}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="areasOfInterest" className="mb-3">
                    <Form.Label>Areas of Interest</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Describe your areas of interest"
                        name="areasOfInterest"
                        value={areasOfInterest}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="communicationStyle" className="mb-3">
                    <Form.Label>Communication Style</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Describe your communication style"
                        name="communicationStyle"
                        value={communicationStyle}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Button variant="primary" onClick={generateProfile} className="w-100">
                    Generate Profile
                </Button>
            </Form>

            {profile && (
                <Alert variant="success" className="mt-4">
                    <h4>Your Personal Profile</h4>
                    <pre>{profile}</pre>
                    <Link to="/">
                        <Button variant="primary" className="mt-3">
                            Home
                        </Button>
                    </Link>
                </Alert>
            )}
        </div>
    );
}

export { MyRegister, MyRegisterPOV };