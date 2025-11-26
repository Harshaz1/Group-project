import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Paper, Container, Link } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../common/ConfirmationDialog';

const LoginHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionType, setActionType] = useState(''); // 'single' or 'all'
    const [itemToDelete, setItemToDelete] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        try {
            const response = await fetch(`${API_URL}/users/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Error fetching history", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setActionType('single');
        setDeleteDialogOpen(true);
    };

    const handleClearHistoryClick = () => {
        setActionType('all');
        setDeleteDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        const token = localStorage.getItem('token');

        if (actionType === 'single') {
            try {
                const response = await fetch(`${API_URL}/users/history/${itemToDelete}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setHistory(history.filter(item => item.id !== itemToDelete));
                    toast.success("Record deleted");
                }
            } catch (error) {
                toast.error("Failed to delete record");
            }
        } else if (actionType === 'all') {
            try {
                const response = await fetch(`${API_URL}/users/history`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setHistory([]);
                    toast.success("History cleared");
                }
            } catch (error) {
                toast.error("Failed to clear history");
            }
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setActionType('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5, position: 'relative', minHeight: '80vh' }}>
            {/* Back Arrow */}
            <IconButton
                onClick={() => navigate('/profile')}
                sx={{ position: 'absolute', top: -10, left: -20, color: 'text.primary' }}
            >
                <ArrowBackIcon sx={{ fontSize: 30 }} />
            </IconButton>

            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 8 }}>
                My Login History
            </Typography>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'transparent' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Last Login Date</Typography>
                    <Typography sx={{ fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Login Time</Typography>
                    <Typography sx={{ fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Logout Time</Typography>
                    <Box sx={{ width: '40px' }}></Box> {/* Spacer for delete icon */}
                </Box>

                {/* List */}
                {history.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', py: 2 }}>
                        <Typography sx={{ width: '30%', textAlign: 'center', color: 'text.secondary' }}>
                            {formatDate(item.login_time)}
                        </Typography>
                        <Typography sx={{ width: '30%', textAlign: 'center', color: 'text.secondary' }}>
                            {formatTime(item.login_time)}
                        </Typography>
                        <Typography sx={{ width: '30%', textAlign: 'center', color: 'text.secondary' }}>
                            {item.logout_time ? formatTime(item.logout_time) : '-'}
                        </Typography>
                        <IconButton onClick={() => handleDeleteClick(item.id)} sx={{ color: 'primary.main' }}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                ))}

                {history.length === 0 && (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: '#888' }}>No history found.</Typography>
                )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Link
                    component="button"
                    variant="body1"
                    onClick={handleClearHistoryClick}
                    underline="hover"
                    sx={{ color: 'primary.main', fontSize: '1.1rem' }}
                >
                    Clear My History
                </Link>
            </Box>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmAction}
                title={actionType === 'all' ? "Clear History" : "Delete Record"}
                content={actionType === 'all' ? "Are you sure you want to clear all login history?" : "Are you sure you want to delete this record?"}
            />
        </Container>
    );
};

export default LoginHistory;
