import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../../assets/logo.png';
import signupBg from '../../assets/header.jpg';

const StyledWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '99vh',
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
});

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '1100px',
    maxWidth: '95%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        width: '100%',
        gap: '20px',
    },
}));

const LeftSide = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
});

const RightCard = styled(Box)(({ theme }) => ({
    flex: 1.2,
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    border: '1px solid #98FB98',
    borderRadius: '30px',
    borderTopLeftRadius: '60px',
    borderBottomLeftRadius: '60px',
    borderTopRightRadius: '60px',
    borderBottomRightRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: '700px',
    height: '100%',
    [theme.breakpoints.down('md')]: {
        borderRadius: '30px',
    }
}));

const StyledInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '9999px',
        border: '2px solid #98FB98',
        backgroundColor: '#fff',
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: 'none',
        },
        '& fieldset': {
            border: 'none',
        },
        '&:hover': {
            border: '2px solid #4CAF50',
        },
        '&.Mui-focused': {
            border: '2px solid #2E8B57',
        }
    },
    '& input': {
        textAlign: 'center',
        fontSize: '1rem',
        color: '#4B5563',
    },
});



const Signup = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return toast.error("All fields are required!");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Invalid email format!");
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters long!");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Signup Successful! Please Login.");
                navigate('/');
            } else {
                toast.error(data.message || "Signup Failed");
            }
        } catch (error) {
            console.error('Signup Error:', error);
            toast.error("An error occurred during signup");
        }
    };

    return (
        <StyledWrapper>
            <StyledContainer>
                {/* Left Side */}
                <LeftSide>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'black', mb: 5, letterSpacing: '0.05em' }}>
                        SIGN UP
                    </Typography>
                    <Box sx={{ width: 200, height: 200, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #89e7ac', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', bgcolor: 'white', boxShadow: 1 }}>
                            <img src={logo} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        </Box>
                    </Box>
                    <Box sx={{ mt: 1, fontSize: '1rem', color: '#1F2937', fontWeight: 600 }}>
                        Already have an Account? <br />
                        <Link href="/" underline="none" sx={{ color: '#2E8B57', fontSize: '1.25rem', fontWeight: 'bold', display: 'inline-block', mt: 1, '&:hover': { color: '#4CAF50', borderBottom: '1px solid #4CAF50' } }}>
                            Log In
                        </Link>
                    </Box>
                </LeftSide>

                {/* Right Side */}
                <RightCard>
                    <Box sx={{ width: '100%', height: 180, position: 'relative', bgcolor: '#f3f4f6' }}>
                        <img src={signupBg} alt="Nature Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 50, background: 'linear-gradient(to top, white, transparent)' }} />
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ px: 6, py: 4, display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, zIndex: 10, bgcolor: 'white' }}>

                        <StyledInput
                            fullWidth
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />

                        <StyledInput
                            fullWidth
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />

                        <StyledInput
                            fullWidth
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <StyledInput
                                fullWidth
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <StyledInput
                                fullWidth
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            sx={{
                                bgcolor: '#98FB98',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                py: 1.5,
                                borderRadius: '9999px',
                                boxShadow: 2,
                                mt: 3,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#7ddba4',
                                }
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </RightCard>
            </StyledContainer>
        </StyledWrapper>
    );
};

export default Signup;
