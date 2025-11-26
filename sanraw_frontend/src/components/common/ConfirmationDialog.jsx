
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '15px',
        padding: theme.spacing(2),
        minWidth: '350px'
    }
}));

const StyledButtonYes = styled(Button)(({ theme }) => ({
    backgroundColor: '#d32f2f', // Red
    color: '#fff',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: '#b71c1c',
    }
}));

const StyledButtonNo = styled(Button)(({ theme }) => ({
    backgroundColor: '#1976d2', // Blue
    color: '#fff',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: '#1565c0',
    }
}));

const ConfirmationDialog = ({ open, onClose, onConfirm, title, content }) => {
    return (
        <StyledDialog open={open} onClose={onClose}>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {title || 'Confirmation'}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" align="center">
                    {content || 'Are you sure you want to proceed?'}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                <StyledButtonNo onClick={onClose} variant="contained">
                    No
                </StyledButtonNo>
                <StyledButtonYes onClick={onConfirm} variant="contained">
                    Yes
                </StyledButtonYes>
            </DialogActions>
        </StyledDialog>
    );
};

export default ConfirmationDialog;
