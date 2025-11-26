import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Avatar, TextField, CircularProgress, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/system';
import { toast } from 'react-toastify';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import ArrowBackIcon

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: '40px',
    borderRadius: '20px',
    maxWidth: '800px',
    width: '90%',
    margin: '40px auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: `2px solid ${theme.palette.primary.light}`,
}));

const DetailRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
        <Typography sx={{ fontWeight: 'bold', color: 'text.primary', minWidth: '200px' }}>{label}:</Typography>
        <Typography sx={{ color: 'text.secondary', flexGrow: 1, textAlign: 'left' }}>{value || 'Not set'}</Typography>
    </Box>
);

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Edit Modal State
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState({ first_name: '', last_name: '', phone_number: '' });

    const fileInputRef = useRef(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [API_URL, navigate]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_image', file);
        // Append other fields to keep them during update (or backend should handle partial updates, my code allows partial but params need to be passed if req.body is utilized for text)
        // My userController updateProfile constructs updateData from body. If I only send file, text fields might be undefined.
        // Let's ensure I send current values or backend handles "undefined" by ignoring them (backend logic does: "Object.keys...delete undefined").
        // So sending just file is fine! text fields will be undefined and ignored in update query.

        setUploading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Profile image updated!");
                fetchProfile(); // Refresh data
            } else {
                toast.error("Failed to update image");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleEditOpen = () => {
        setEditData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone_number: user?.phone_number || ''
        });
        setOpen(true);
    };

    const handleEditClose = () => {
        setOpen(false);
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                fetchProfile();
                setOpen(false);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Update error", error);
            toast.error("Error updating profile");
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3, position: 'relative' }}>
            {/* Back Arrow */}
            <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{ position: 'absolute', top: 20, left: 20, color: 'text.primary' }}
            >
                <ArrowBackIcon sx={{ fontSize: 30 }} />
            </IconButton>

            {/* Header Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: 4 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={user?.profile_image}
                        sx={{ width: 120, height: 120, border: 4, borderColor: 'background.paper', boxShadow: 3 }}
                    />
                    <Box
                        sx={{
                            position: 'absolute', bottom: 0, right: 0,
                            bgcolor: 'background.paper', borderRadius: '50%', p: 0.5,
                            boxShadow: 1, cursor: 'pointer', border: 1, borderColor: 'primary.light'
                        }}
                        onClick={triggerFileInput}
                    >
                        {uploading ? <CircularProgress size={20} /> : <PhotoCamera sx={{ color: 'primary.main' }} />}
                    </Box>
                    <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Box>
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                    {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                    {user?.role ? user?.role.toUpperCase() : 'USER'}
                </Typography>
            </Box>

            {/* Details Card */}
            <StyledPaper elevation={0}>
                <DetailRow label="First Name" value={user?.first_name} />
                <DetailRow label="Last Name" value={user?.last_name} />
                <DetailRow label="Email Address" value={user?.email} />
                <DetailRow label="Telephone Number" value={user?.phone_number} />
            </StyledPaper>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                <Button
                    variant="contained"
                    onClick={handleEditOpen}
                    sx={{
                        bgcolor: 'primary.light', color: 'white', borderRadius: '25px',
                        fontSize: '1.2rem', textTransform: 'none', px: 4, py: 1,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'primary.main' }
                    }}
                >
                    Edit Profile
                </Button>
                <Button
                    variant="contained"
                    onClick={() => navigate('/login-history')}
                    sx={{
                        bgcolor: 'primary.light', color: 'white', borderRadius: '25px',
                        fontSize: '1.2rem', textTransform: 'none', px: 4, py: 1,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'primary.main' }
                    }}
                >
                    My Login History
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/');
                        toast.success("Logged out successfully");
                    }}
                    sx={{
                        bgcolor: '#ff4444', color: 'white', borderRadius: '25px',
                        fontSize: '1.2rem', textTransform: 'none', px: 4, py: 1,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#cc0000' }
                    }}
                >
                    Log Out
                </Button>
            </Stack>

            {/* Edit Dialog */}
            <Dialog open={open} onClose={handleEditClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Profile</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="First Name"
                            name="first_name"
                            value={editData.first_name}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            name="last_name"
                            value={editData.last_name}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Telephone Number"
                            name="phone_number"
                            value={editData.phone_number}
                            onChange={handleEditChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleEditClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveProfile} variant="contained" sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;
