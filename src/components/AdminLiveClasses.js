import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLiveClasses = () => {
    const [title, setTitle] = useState('');
    const [videoId, setVideoId] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [liveClasses, setLiveClasses] = useState([]);
    const [editClassId, setEditClassId] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [adminId, setAdminId] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = process.env.REACT_APP_API_URL;

    // Fetch live classes
    const fetchLiveClasses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/live-classes`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setLiveClasses(response.data);
        } catch (err) {
            console.error('Error fetching live classes:', err);
            toast.error('Failed to fetch live classes. Please check your authentication.');
        } finally {
            setLoading(false);
        }
    },[API_BASE_URL]);

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to fetch users. Please check your authentication.');
        } finally {
            setLoading(false);
        }
    },[API_BASE_URL]);
    // Fetch admin's ID, live classes, and users
    useEffect(() => {
        fetchAdminId();
        fetchLiveClasses();
        fetchUsers();
    }, [fetchLiveClasses, fetchUsers]);

    // Fetch admin's ID from localStorage
    const fetchAdminId = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
            setAdminId(user._id);
            setSelectedUsers([user._id]);
        }
    };



    // Extract YouTube Video ID from URL
    const extractVideoId = (url) => {
        const regex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\s?]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Handle YouTube URL input
    const handleYoutubeUrlChange = (e) => {
        const url = e.target.value;
        setYoutubeUrl(url);

        // Extract video ID from URL
        const videoId = extractVideoId(url);
        if (videoId) {
            setVideoId(videoId);
        }
    };

    // Handle user selection
    const handleUserSelection = (userId) => {
        // Find the user object from the users array
        const user = users.find((user) => user._id === userId);

        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
            toast.success(`User "${user.name}" removed from allowed list!`); // Include user's name
        } else {
            setSelectedUsers([...selectedUsers, userId]);
            toast.success(`User "${user.name}" added to allowed list!`); // Include user's name
        }
    };

    // Reset allowed users
    const resetAllowedUsers = () => {
        setSelectedUsers([]);
        toast.success('Allowed users reset successfully!');
    };

    // Add or update live class
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editClassId) {
            // Edit mode
            try {
                const response = await axios.put(
                    `${API_BASE_URL}/api/live-classes/${editClassId}`,
                    { title, videoId, description, thumbnail, allowedUsers: selectedUsers },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                if (response.data.message) {
                    toast.success('Live class updated successfully');
                    resetForm();
                    fetchLiveClasses();
                }
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to update live class');
            }
        } else {
            // Add new class mode
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/add-live-class`,
                    { title, videoId, description, thumbnail, allowedUsers: selectedUsers },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                if (response.data.message) {
                    toast.success(response.data.message);
                    resetForm();
                    fetchLiveClasses();
                }
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to add live class');
            }
        }
    };
    // Handle edit click
    const handleEdit = (liveClass) => {
        setEditClassId(liveClass._id);
        setTitle(liveClass.title);
        setVideoId(liveClass.videoId);
        setDescription(liveClass.description);
        setThumbnail(liveClass.thumbnail);
        setYoutubeUrl(`https://youtu.be/${liveClass.videoId}`);
        setSelectedUsers(liveClass.allowedUsers || []);
        toast.success('Live class loaded for editing!');
    };

    // Cancel edit
    const resetForm = () => {
        setEditClassId(null);
        setTitle('');
        setVideoId('');
        setDescription('');
        setThumbnail('');
        setYoutubeUrl('');
        setSelectedUsers([adminId]);
        // toast.success('Form reset successfully!');
    };

    // Delete live class
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this live class?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/live-classes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success('Live class deleted successfully');
            fetchLiveClasses();
        } catch (err) {
            toast.error('Failed to delete live class');
        }
    };

    return (
        <Container className="mt-4" style={{ marginBottom: '80px' }}>
            <h2 className="text-center mb-4">{editClassId ? 'Update Video' : 'Add Video'}</h2>

            {/* Form for Add & Edit */}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>YouTube Video URL</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter YouTube Video URL"
                        value={youtubeUrl}
                        onChange={handleYoutubeUrlChange}
                        required
                    />
                    <small className="text-muted">
                        Example: https://youtu.be/kdXKkroMUoo or https://www.youtube.com/watch?v=kdXKkroMUoo
                    </small>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>YouTube Video ID</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="YouTube Video ID will auto-fill here"
                        value={videoId}
                        readOnly
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Thumbnail URL (Optional)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Leave blank to use default YouTube thumbnail"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                    />
                    <small className="text-muted">
                        Default thumbnail: https://img.youtube.com/vi/{videoId}/hqdefault.jpg
                    </small>
                </Form.Group>

                {/* User Selection */}
                <Form.Group className="mb-3">
                    <Form.Label>Select Users</Form.Label>
                    <ListGroup>
                        {users.map(user => (
                            <ListGroup.Item key={user._id}>
                                <Form.Check
                                    type="checkbox"
                                    label={user.name}
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => handleUserSelection(user._id)}
                                    disabled={user._id === adminId}
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Form.Group>

                <div className="d-flex justify-content-between mb-3">
                    <Button variant="secondary" onClick={resetAllowedUsers}>
                        Reset Allowed Users
                    </Button>
                    <Button variant="success" type="submit">
                        {editClassId ? 'Update Video' : 'Add Video'}
                    </Button>
                </div>

                {/* Cancel Edit Button (Only show in Edit Mode) */}
                {editClassId && (
                    <Button variant="secondary" className="ms-2" onClick={resetForm}>
                        Cancel Edit
                    </Button>
                )}
            </Form>

            {/* Live Classes List */}
            <h3 className="mt-4">Live Classes</h3>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Row>
                    {liveClasses.map((liveClass) => (
                        <Col key={liveClass._id} md={4} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Img
                                    variant="top"
                                    src={liveClass.thumbnail || `https://img.youtube.com/vi/${liveClass.videoId}/hqdefault.jpg`}
                                    alt="Live Class Thumbnail"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{liveClass.title}</Card.Title>
                                    <Card.Text>{liveClass.description}</Card.Text>
                                    <div className="d-flex justify-content-between mt-auto">
                                        <Button
                                            variant="info"
                                            onClick={() => handleEdit(liveClass)}
                                            className="me-2"
                                        >
                                            Edit Video
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(liveClass._id)}
                                        >
                                            Delete Video
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
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

export default AdminLiveClasses;