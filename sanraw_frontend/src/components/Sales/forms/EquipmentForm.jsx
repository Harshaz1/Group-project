import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EquipmentForm = ({ onAdd }) => {
    const [equipment, setEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [discount, setDiscount] = useState('');

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/equipment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setEquipment(data);
            } else {
                toast.error("Failed to fetch equipment");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading equipment");
        }
    };

    const handleEquipmentSelect = (e) => {
        const equipmentId = e.target.value;
        setSelectedEquipment(equipmentId);

        const item = equipment.find(eq => eq.id === equipmentId);
        if (item) {
            setUnitPrice(item.price);
        }
    };

    const handleAdd = () => {
        if (!selectedEquipment || !quantity) {
            return toast.error("Equipment and Quantity required");
        }

        const item = equipment.find(eq => eq.id === selectedEquipment);
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
            category: 'equipment',
            productName: item.equipment_name,
            quantity: qty,
            discount: disc,
            unitPrice: price,
            extPrice: extPrice.toFixed(2)
        });

        // Reset
        setSelectedEquipment('');
        setQuantity('');
        setUnitPrice('');
        setDiscount('');
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Select Equipment:</Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedEquipment}
                        onChange={handleEquipmentSelect}
                        displayEmpty
                        sx={{ borderRadius: '10px', border: '1px solid #98FB98' }}
                    >
                        <MenuItem value="" disabled>Choose equipment...</MenuItem>
                        {equipment.map(item => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.equipment_name} - Stock: {item.stock}
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
                    Add Equipment
                </Button>
            </Box>
        </Box>
    );
};

export default EquipmentForm;
