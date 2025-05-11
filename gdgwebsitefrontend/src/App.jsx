import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {Col, Container, Row, Navbar, Button, Nav, FormGroup, ListGroup} from 'react-bootstrap';
import {Routes, Route, Outlet, Link, useNavigate, Form} from 'react-router';
import './App.css';
import {MyUploadingFormFile, MyUploadingFormFolder} from "./components/AddingForm.jsx";
import {MapDetails, MapGame} from "./components/maps.jsx";
import {useEffect, useState} from "react";
import {MyLogin} from "./components/login.jsx";
import {ProfileMenu} from "./components/Profile.jsx";


function App() {

    const [selectedGraphId, setSelectedGraph] = useState(null);


    return (
        <Routes>
            <Route path='/login' element={<MyLogin/>}/>
            <Route path='/' element={<Layout
                setSelectedGraph={setSelectedGraph}
            />}>

                <Route index element={<Home
                    setSelectedGraph={setSelectedGraph}
                    selectedGraphId={selectedGraphId}
                />}/>

                <Route path='maps/:mapId' element={<MapDetails
                    selectedGraphId={selectedGraphId}
                />}/>

                <Route path='maps/:mapId/game' element={<MapGame/>}/>

            </Route>


            <Route path='/*' element={<DefaultRoute/>}/>
        </Routes>
    )
}

function Home(props) {



    return (
        <>
            <Row>


                <Col xs={3} className="bg-light vh-100 p-3">
                    <MyAside setSelectedGraph={props.setSelectedGraph}
                             selectedGraphId={props.selectedGraphId}
                    />
                </Col>
                <Col xs={9} className="justify-content-center align-items-center">


                    <MyUploadingFormFile/>

                    <MapDetails selectedGraphId={props.selectedGraphId}/>


                </Col>
            </Row>
        </>
    );
}


function MyAside(props) {
    const [graphs, setGraphs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        fetch("http://192.168.1.3:8000/maps/")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setGraphs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching graphs:", err);
                setError('Failed to fetch graphs');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }


    return (
        <Row>
            {/*<Row>
                <MyUploadingFormFolder/>

            </Row>*/}

            <Row>
                <div>
                    <h5 className="mb-3">Available Graphs:</h5>
                    <ListGroup>
                        {graphs.map(graph => (
                            <ListGroup.Item
                                key={graph.id}
                                action // Adds a clickable action style
                                onClick={() => {
                                    if (props.selectedGraphId === graph.id) {
                                        // Deselect if the same graph is clicked again
                                        navigate('/')
                                        props.setSelectedGraph(null); // or undefined, depending on your preference
                                    } else {
                                        // Select the clicked graph
                                        props.setSelectedGraph(graph.id);
                                        navigate(`/maps/${graph.id}`)

                                    }

                                }}
                                active={props.selectedGraphId === graph.id} // Adds an active style to the selected item
                            >
                                {graph.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>

            </Row>

        </Row>


    );
}


function Layout(props) {

    return (
        <Container fluid>

            <Row>
                <Col>
                    <MyHeader
                        setSelectedGraph={props.setSelectedGraph}
                    />
                </Col>
            </Row>


            <Outlet/>

            <Row>
                <Col>
                    <MyFooter/>
                </Col>
            </Row>
        </Container>
    )
}


function DefaultRoute(props) {
    return (
        <Container fluid className="text-center py-4">
            <img src="/paperino.jpeg" alt="Paperino" className="img-fluid rounded mb-4" style={{maxHeight: '300px'}}/>

            <h4 className="text-danger">No data here: This is not a valid page!</h4>
            <Link to='/' className="btn btn-primary mt-3">
                Go back to main page
            </Link>
        </Container>
    );
}


function MyHeader(props) {
    const navigate = useNavigate();
    return (
        <Navbar bg="primary" variant="dark">
            <Container fluid>
                <Row className="w-100 align-items-center">
                    <Col xs="auto" className="text-start">
                        <i
                            className="bi bi-house-heart-fill text-white fs-1"
                            role="button"
                            onClick={() => {
                                props.setSelectedGraph(null);
                                navigate('/');
                            }}
                        />
                    </Col>

                    <Col className="text-center">
                        <Navbar.Text className="text-white fw-bold">
                            Braynr | 403-forbidden
                        </Navbar.Text>
                    </Col>

                    <Col xs="auto" className="text-end">
                        <ProfileMenu/>
                    </Col>
                </Row>
            </Container>
        </Navbar>

    );
}

function MyFooter(props) {
    return (<footer>
        <p>&copy; 403-forbidden | gdg-ai-hackathon</p>
        <div id="time"></div>
    </footer>);
}

export default App
