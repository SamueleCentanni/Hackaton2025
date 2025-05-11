import React, {useEffect, useState} from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import {useNavigate} from "react-router";

function MapDetails(props) {

    if (props.selectedGraphId) {
        const [graphData, setGraphData] = useState({nodes: [], links: []});
        const navigate = useNavigate()

        useEffect(() => {


            const fetchGraphData = async () => {
                try {
                    const response = await fetch(`http://192.168.1.3:8000/maps/${props.selectedGraphId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();

                    // Ensure the fetched data is in the correct structure
                    if (data.json_map) {
                        const {nodes = [], links = []} = data.json_map;
                        setGraphData({nodes, links});
                    } else {
                        console.error('Invalid graph data structure:', data);
                    }
                } catch (error) {
                    console.error('Error fetching graph data:', error);
                }
            };

            if (props.selectedGraphId) {
                fetchGraphData();
            }
        }, [props.selectedGraphId]);

        return (
            <Container fluid className="my-5">
                {/* Play Button */}
                <Row className="mb-4 justify-content-center">
                    <Col xs="auto">
                        <Button
                            className="btn btn-lg btn-primary d-flex align-items-center"
                            onClick={
                                () => {
                                    navigate(`/maps/${props.selectedGraphId}/game`);
                                }
                            }
                            style={{
                                borderRadius: '50px',
                                padding: '12px 24px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            <i className="bi bi-play-circle-fill" style={{ fontSize: '1.75rem' }}

                            />
                            <span className="ms-3">Play</span>
                        </Button>
                    </Col>
                </Row>

                {/* Graph Section */}
                <Row className="justify-content-center">
                    <Col xs={12} lg={10} xl={8}>
                        <div
                            style={{
                                height: '600px',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                backgroundColor: '#fff',
                                padding: '15px',
                                overflow: 'hidden',
                            }}
                        >
                            <ForceGraph2D
                                graphData={graphData}
                                nodeLabel="name"
                                nodeAutoColorBy="group"
                                linkWidth={2}
                                linkDirectionalParticles={4}
                                linkDirectionalParticleSpeed={0.01}
                                nodeRelSize={12}
                                backgroundColor="#f7f7f7"
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

}


function MapGame(props) {
    

}

export {MapDetails, MapGame};