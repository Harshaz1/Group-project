import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Typography, TextField, Button, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../../assets/logo.png';
import headerBg from '../../assets/header.jpg';

const StyledWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
});

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '1000px',
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
    maxWidth: '500px',
    backgroundColor: '#fff',
    border: '1px solid #98FB98',
    borderRadius: '30px',
    borderTopLeftRadius: '60px',
    borderBottomLeftRadius: '60px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: '600px',
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
            border: 'none', // Handle border via direct border prop to avoid double border
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
        textAlign: 'left',
        paddingLeft: '25px',
        fontSize: '1rem',
        color: '#4B5563',
    },
});



const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            return toast.error("Please fill in all fields");
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username:username.trim(), password:password.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success("Login Successful");
                navigate('/dashboard');
            } else {
                toast.error(data.message || "Login Failed");
            }
        } catch (error) {
            console.error('Login Error:', error);
            toast.error("An error occurred during login");
        }
    };

    return (
        <StyledWrapper>
            <StyledContainer>
                {/* Left Side */}
                <LeftSide>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'black', mb: 5, letterSpacing: '0.05em' }}>
                        LOG IN
                    </Typography>
                    <Box sx={{ width: 250, height: 250, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #89e7ac', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', bgcolor: 'white', boxShadow: 1 }}>
                            <img src={logo} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        </Box>
                    </Box>

                </LeftSide>

                {/* Right Side */}
                <RightCard>
                    <Box sx={{ width: '100%', height: 220, position: 'relative', bgcolor: '#f3f4f6' }}>
                        <img src={headerBg} alt="Nature Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 40, background: 'linear-gradient(to top, white, transparent)' }} />
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ px: 6, py: 5, display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1, zIndex: 10, bgcolor: 'white' }}>

                        <StyledInput
                            fullWidth
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <StyledInput
                            fullWidth
                            type= {showPassword ? 'text' :"password"}
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ mr: 1 }}>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            sx={{ color: '#2E8B57' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ textAlign: 'left', ml: 2, mt: -1 }}>
                            <Link href="/change-password" underline="hover" sx={{ color: '#2E8B57', fontSize: '1rem', fontWeight: 500 }}>
                                Change Password?
                            </Link>
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
                                mt: 2,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#7ddba4',
                                }
                            }}
                        >
                            Log In
                        </Button>
                    </Box>
                </RightCard>
            </StyledContainer>
        </StyledWrapper>
    );
};

export default Login;
