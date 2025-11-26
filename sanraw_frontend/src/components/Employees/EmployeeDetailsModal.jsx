import React from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Avatar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const StyledDialog = styled(Dialog)({
    '& .MuiPaper-root': {
        borderRadius: '20px',
        padding: '10px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #98FB98',
        boxShadow: '0 0 20px rgba(46, 139, 87, 0.2)',
    },
});

const ActiveStatus = styled(Typography)({
    color: '#98FB98',
    fontSize: '0.9rem',
    fontWeight: 500,
});

const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 'bold', color: '#333' }}>{label}:</Typography>
        <Typography sx={{ color: '#555' }}>{value || '-'}</Typography>
    </Box>
);

const EmployeeDetailsModal = ({ open, onClose, employee, onViewHistory, onEdit, onDelete }) => {
    if (!employee) return null;

    return (
        <StyledDialog open={open} onClose={onClose}>
            <DialogContent sx={{ position: 'relative', pt: 4, pb: 4 }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: '#aaa' }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={employee.profile_image}
                        sx={{ width: 80, height: 80, bgcolor: '#00BFFF', mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {employee.first_name} {employee.last_name}
                    </Typography>
                    <ActiveStatus>{employee.status === 'active' ? 'Active Now' : 'Offline'}</ActiveStatus>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <InfoRow label="First Name" value={employee.first_name} />
                    <InfoRow label="Last Name" value={employee.last_name} />
                    <InfoRow label="Roll" value={employee.role} />
                    <InfoRow label="Email Address" value={employee.email} />
                    <InfoRow label="Recovery Email Address" value={employee.recovery_email} />
                    <InfoRow label="Telephone Number" value={employee.phone_number} />
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => onViewHistory(employee.id)}
                    sx={{
                        bgcolor: '#98FB98', color: 'white', mb: 2, borderRadius: '20px', textTransform: 'none',
                        '&:hover': { bgcolor: '#7ddba4' }
                    }}
                >
                    View Login History
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => onEdit(employee)}
                        sx={{
                            bgcolor: '#98FB98', color: 'white', borderRadius: '20px', textTransform: 'none',
                            '&:hover': { bgcolor: '#7ddba4' }
                        }}
                    >
                        Edit Account
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => onDelete(employee.id)}
                        sx={{
                            bgcolor: '#98FB98', color: 'white', borderRadius: '20px', textTransform: 'none',
                            '&:hover': { bgcolor: '#7ddba4' }
                        }}
                    >
                        Remove Account
                    </Button>
                </Box>

            </DialogContent>
        </StyledDialog>
    );
};

export default EmployeeDetailsModal;
