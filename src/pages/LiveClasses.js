import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LiveClasses = () => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(''); // Error state
    const API_BASE_URL = process.env.REACT_APP_API_URL;
    // Fetch live classes from the server
    useEffect(() => {
        const fetchLiveClasses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/live-classes`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLiveClasses(response.data); // Set live classes data
                setError(''); // Clear any previous errors
            } catch (error) {
                console.error("Error fetching live classes:", error);
                setError(error.response?.data?.message || 'Failed to fetch live classes. Please try again later.');
            } finally {
                setLoading(false); // Loading complete
            }
        };

        fetchLiveClasses();
    }, [API_BASE_URL]);

    // Handle "Watch Now" button click
    const handleWatchNow = (videoId) => {
        toast.info('Redirecting to YouTube...', {
            autoClose: 2000, // Toast will close after 2 seconds
            onClose: () => {
                // Redirect to YouTube after the toast closes
                window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
            },
        });
    };

    return (
        <Container className="mt-4" style={{ marginBottom: '80px' }}>
            <h2>Live Classes</h2>

            {/* Loading Spinner */}
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {/* Error Message */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Display Live Classes */}
            {!loading && !error && (
                <>
                    {liveClasses.length > 0 ? (
                        <Row>
                            {liveClasses.map((liveClass, index) => (
                                <Col key={index} md={4} className="mb-4">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Img
                                            variant="top"
                                            src={liveClass.thumbnail || `https://img.youtube.com/vi/${liveClass.videoId}/hqdefault.jpg`}
                                            alt="Live Class Thumbnail"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title>{liveClass.title}</Card.Title>
                                            <Card.Text>{liveClass.description}</Card.Text>
                                            <button
                                                onClick={() => handleWatchNow(liveClass.videoId)}
                                                className="btn btn-success mt-auto w-100"
                                            >
                                                Watch Now
                                            </button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <p>No live classes available.</p>
                    )}
                </>
            )}

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Container>
    );
};

export default LiveClasses;