import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { toast } from 'react-toastify';

const StyledWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
});

const StyledCard = styled(Paper)(({ theme }) => ({
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '20px',
    border: '1px solid #98FB98',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
}));

const StyledInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '9999px',
        '& fieldset': {
            borderColor: '#98FB98',
            borderWidth: '2px',
        },
        '&:hover fieldset': {
            borderColor: '#4CAF50',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#2E8B57',
        },
    },
    '& input': {
        textAlign: 'center',
    },
});

const ChangePassword = () => {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, currentPassword, newPassword, confirmNewPassword } = formData;

        if (!email || !currentPassword || !newPassword || !confirmNewPassword) {
            return toast.error("Please fill in all fields");
        }

        if (newPassword !== confirmNewPassword) {
            return toast.error("New passwords do not match");
        }

        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Password changed successfully!");
                navigate('/');
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        }
    };

    return (
        <StyledWrapper>
            <StyledCard elevation={0}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'black' }}>
                    Change Password
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                    Know your password? Change it here.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <StyledInput
                        fullWidth
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <StyledInput
                        fullWidth
                        name="currentPassword"
                        type="password"
                        placeholder="Current Password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                    />
                    <StyledInput
                        fullWidth
                        name="newPassword"
                        type="password"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />
                    <StyledInput
                        fullWidth
                        name="confirmNewPassword"
                        type="password"
                        placeholder="Confirm New Password"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        sx={{
                            bgcolor: '#98FB98',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            py: 1.5,
                            borderRadius: '9999px',
                            mt: 1,
                            '&:hover': { bgcolor: '#7ddba4' },
                            textTransform: 'none',
                        }}
                    >
                        Change Password
                    </Button>

                    <Link
                        component="button"
                        onClick={() => navigate('/')}
                        sx={{ color: '#2E8B57', mt: 1, fontWeight: 600, textDecoration: 'none' }}
                    >
                        Back to Login
                    </Link>
                </Box>
            </StyledCard>
        </StyledWrapper>
    );
};

export default ChangePassword;
