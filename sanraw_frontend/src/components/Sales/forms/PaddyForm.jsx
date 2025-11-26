import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PaddyForm = ({ onAdd }) => {
    const [paddyItems, setPaddyItems] = useState([]);
    const [selectedPaddy, setSelectedPaddy] = useState('');
    const [weight, setWeight] = useState('');
    const [pricePerKg, setPricePerKg] = useState('');
    const [discount, setDiscount] = useState('');

    // Fetch paddy items
    useEffect(() => {
        fetchPaddyItems();
    }, []);

    const fetchPaddyItems = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/paddy`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPaddyItems(data);
            } else {
                toast.error("Failed to fetch paddy items");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading paddy items");
        }
    };

    const handlePaddySelect = (e) => {
        const paddyId = e.target.value;
        setSelectedPaddy(paddyId);

        // Auto-fill price
        const paddy = paddyItems.find(p => p.id === paddyId);
        if (paddy) {
            setPricePerKg(paddy.price);
        }
    };

    const handleAdd = () => {
        if (!selectedPaddy || !weight) {
            return toast.error("Paddy and Weight required");
        }

        const paddy = paddyItems.find(p => p.id === selectedPaddy);
        if (!paddy) return;

        const qty = parseFloat(weight);
        if (qty > paddy.stock) {
            return toast.error(`Insufficient stock! Only ${paddy.stock} kg available.`);
        }

        const price = parseFloat(pricePerKg);
        const disc = parseFloat(discount) || 0;
        const extPrice = (qty * price) - disc;

        onAdd({
            item_id: paddy.id,
            category: 'paddy',
            productName: paddy.paddy_name,
            quantity: qty,
            discount: disc,
            unitPrice: price,
            extPrice: extPrice.toFixed(2)
        });

        // Reset
        setSelectedPaddy('');
        setWeight('');
        setPricePerKg('');
        setDiscount('');
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Select Paddy Type:</Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedPaddy}
                        onChange={handlePaddySelect}
                        displayEmpty
                        sx={{ borderRadius: '10px', border: '1px solid #98FB98' }}
                    >
                        <MenuItem value="" disabled>Choose a paddy type...</MenuItem>
                        {paddyItems.map(paddy => (
                            <MenuItem key={paddy.id} value={paddy.id}>
                                {paddy.paddy_name} - Stock: {paddy.stock} kg
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Price Per Kg:</Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="number"
                    value={pricePerKg}
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', border: '1px solid #98FB98', bgcolor: '#f5f5f5' } }}
                />
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Weight (Kg):</Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', border: '1px solid #98FB98' } }}
                />
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Discount (Optional):</Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', border: '1px solid #98FB98' } }}
                />
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    sx={{ bgcolor: '#4CAF50', color: 'white', borderRadius: '20px', px: 6, py: 1, fontSize: '1.1rem' }}
                >
                    Add Paddy
                </Button>
            </Box>
        </Box>
    );
};

export default PaddyForm;
