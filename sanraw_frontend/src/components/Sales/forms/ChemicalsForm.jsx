import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChemicalsForm = ({ onAdd }) => {
    const [chemicals, setChemicals] = useState([]);
    const [selectedChemical, setSelectedChemical] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [discount, setDiscount] = useState('');

    useEffect(() => {
        fetchChemicals();
    }, []);

    const fetchChemicals = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/chemicals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setChemicals(data);
            } else {
                toast.error("Failed to fetch chemicals");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading chemicals");
        }
    };

    const handleChemicalSelect = (e) => {
        const chemicalId = e.target.value;
        setSelectedChemical(chemicalId);

        const item = chemicals.find(ch => ch.id === chemicalId);
        if (item) {
            setUnitPrice(item.price);
        }
    };

    const handleAdd = () => {
        if (!selectedChemical || !quantity) {
            return toast.error("Chemical and Quantity required");
        }

        const item = chemicals.find(ch => ch.id === selectedChemical);
        if (!item) return;

        const qty = parseFloat(quantity);
        if (qty > item.stock) {
            return toast.error(`Insufficient stock! Only ${item.stock} available.`);
        }

        const price = parseFloat(unitPrice);
        const disc = parseFloat(discount) || 0;
        const extPrice = (qty * price) - disc;

        onAdd({
            item_id: item.id,
            category: 'fertilizer_pesticide',
            productName: item.name,
            quantity: qty,
            discount: disc,
            unitPrice: price,
            extPrice: extPrice.toFixed(2)
        });

        // Reset
        setSelectedChemical('');
        setQuantity('');
        setUnitPrice('');
        setDiscount('');
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Select Fertilizer/Pesticide:</Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedChemical}
                        onChange={handleChemicalSelect}
                        displayEmpty
                        sx={{ borderRadius: '10px', border: '1px solid #98FB98' }}
                    >
                        <MenuItem value="" disabled>Choose fertilizer/pesticide...</MenuItem>
                        {chemicals.map(item => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name} - Stock: {item.stock}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Unit Price:</Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="number"
                    value={unitPrice}
                    disabled
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', border: '1px solid #98FB98', bgcolor: '#f5f5f5' } }}
                />
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Quantity:</Typography>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', border: '1px solid #98FB98' } }}
                />
            </Box>

            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Discount (Rs.):</Typography>
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
                    Add Chemical
                </Button>
            </Box>
        </Box>
    );
};

export default ChemicalsForm;
