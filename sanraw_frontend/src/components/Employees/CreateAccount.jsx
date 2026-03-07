import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Box, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledFormContainer = styled(Box)({
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '1px solid #98FB98',
});

const StyledInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        '&.Mui-focused fieldset': {
            borderColor: '#2E8B57',
        },
    },
    marginBottom: '20px',
});

const CreateAccount = ({ onAccountCreated }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('employee'); // Default to employee
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !username || !password || !confirmPassword) {
            return toast.error("All fields are required!");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        const token = localStorage.getItem('token');
        if (!token) return toast.error("Unauthorized");

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    password,
                    role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully");
                // Clear form
                setFirstName('');
                setLastName('');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setRole('employee');
                if (onAccountCreated) onAccountCreated();
            } else {
                toast.error(data.message || "Failed to create account");
            }
        } catch (error) {
            console.error('Create Account Error:', error);
            toast.error("An error occurred");
        }
    };

    return (
        <StyledFormContainer component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#2E8B57' }}>
                Create New Employee Account
            </Typography>

            <StyledInput
                fullWidth
                label="First Name"
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />

            <StyledInput
                fullWidth
                label="Last Name"
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />

            <StyledInput
                fullWidth
                type="text"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <StyledInput
                fullWidth
                type="password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <StyledInput
                fullWidth
                type="password"
                label="Confirm Password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    borderRadius: '50px',
                    boxShadow: 2,
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: '#7ddba4',
                    }
                }}
            >
                Create Account
            </Button>
        </StyledFormContainer>
    );
};

export default CreateAccount;
