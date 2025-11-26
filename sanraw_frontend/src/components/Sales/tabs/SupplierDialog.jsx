import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SupplierDialog = ({ open, onClose, onSave, supplier = null }) => {
    const [formData, setFormData] = useState(supplier || { name: '', address: '', phone: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const method = supplier ? 'PUT' : 'POST';
        const url = supplier ? `${API_URL}/suppliers/${supplier.id}` : `${API_URL}/suppliers`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Supplier ${supplier ? 'updated' : 'added'} successfully!`);
                onSave(data);
                onClose();
            } else {
                toast.error("Failed to save supplier");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving supplier");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            required
                            fullWidth
                            label="Company Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            label="Company Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
                        <TextField
                            fullWidth
                            label="Company Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="success">
                        Save Supplier
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SupplierDialog;
