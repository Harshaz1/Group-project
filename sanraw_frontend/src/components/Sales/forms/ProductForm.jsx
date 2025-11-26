import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductForm = ({ onAdd }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [discount, setDiscount] = useState('');

    // Fetch inventory items
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem('token');
        try {
            // Fetch equipment and chemicals
            const [equipmentRes, chemicalsRes] = await Promise.all([
                fetch(`${API_URL}/equipment`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/chemicals`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (equipmentRes.ok && chemicalsRes.ok) {
                const equipment = await equipmentRes.json();
                const chemicals = await chemicalsRes.json();

                // Combine and format
                const combinedProducts = [
                    ...equipment.map(item => ({
                        id: item.id,
                        name: item.equipment_name,
                        price: item.price,
                        stock: item.stock,
                        category: 'equipment'
                    })),
                    ...chemicals.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        stock: item.stock,
                        category: 'fertilizer_pesticide'
                    }))
                ];

                setProducts(combinedProducts);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading products");
        }
    };

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setSelectedProduct(productId);

        // Auto-fill price
        const product = products.find(p => p.id === productId);
        if (product) {
            setUnitPrice(product.price);
        }
    };

    const handleAdd = () => {
        if (!selectedProduct || !quantity) {
            return toast.error("Product and Quantity required");
        }

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const qty = parseFloat(quantity);
        if (qty > product.stock) {
            return toast.error(`Insufficient stock! Only ${product.stock} available.`);
        }

        const price = parseFloat(unitPrice);
        const disc = parseFloat(discount) || 0;
        const extPrice = (qty * price) - disc;

        onAdd({
            item_id: product.id,
            category: product.category,
            productName: product.name,
            quantity: qty,
            discount: disc,
            unitPrice: price,
            extPrice: extPrice.toFixed(2)
        });

        // Reset
        setSelectedProduct('');
        setQuantity('');
        setUnitPrice('');
        setDiscount('');
    };

    return (
        <Box sx={{ maxWidth: '600px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>Select Product:</Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedProduct}
                        onChange={handleProductSelect}
                        displayEmpty
                        sx={{ borderRadius: '10px', border: '1px solid #98FB98' }}
                    >
                        <MenuItem value="" disabled>Choose a product...</MenuItem>
                        {products.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                                {product.name} - Stock: {product.stock}
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
                    Add Product
                </Button>
            </Box>
        </Box>
    );
};

export default ProductForm;
