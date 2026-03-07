import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Paper, Container, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LoginHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
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
                    <Typography sx={{ fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Last Login Date</Typography>
                    <Typography sx={{ fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Login Time</Typography>
                    <Typography sx={{ fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Logout Time</Typography>
                    <Box sx={{ width: '40px' }}></Box> {/* Spacer for delete icon */}
                </Box>

                {/* List */}
                {history.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', py: 2 }}>
                        <Typography sx={{ width: '33%', textAlign: 'center', color: 'text.secondary' }}>
                            {formatDate(item.login_time)}
                        </Typography>
                        <Typography sx={{ width: '33%', textAlign: 'center', color: 'text.secondary' }}>
                            {formatTime(item.login_time)}
                        </Typography>
                        <Typography sx={{ width: '33%', textAlign: 'center', color: 'text.secondary' }}>
                            {item.logout_time ? formatTime(item.logout_time) : '-'}
                        </Typography>
                    </Box>
                ))}

                {history.length === 0 && (
                    <Typography sx={{ textAlign: 'center', mt: 4, color: '#888' }}>No history found.</Typography>
                )}
            </Paper>
        </Container>
    );
};

export default LoginHistory;
