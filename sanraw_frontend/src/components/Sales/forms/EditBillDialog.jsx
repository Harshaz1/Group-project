import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    Tabs, Tab, Typography, Grid, TextField, Select, MenuItem, IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import EquipmentForm from './EquipmentForm';
import ChemicalsForm from './ChemicalsForm';
import PaddyForm from './PaddyForm';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../common/ConfirmationDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SubTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    flex: 1,
});

const EditBillDialog = ({ open, onClose, bill, onUpdate }) => {
    const [subTabValue, setSubTabValue] = useState(0);
    const [billItems, setBillItems] = useState([]);
    const [customerDetails, setCustomerDetails] = useState({ name: '', address: '', phone: '' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemIndexToDelete, setItemIndexToDelete] = useState(null);

    useEffect(() => {
        if (bill) {
            setCustomerDetails({
                name: bill.customer_name,
                address: bill.customer_address,
                phone: bill.customer_phone
            });
            // Map existing items to match the structure used in SellsTab/BillTable
            // Existing items from DB might have different field names (snake_case vs camelCase)
            // Checked BillTable: expects productName, unitPrice, quantity, discount, extPrice
            // Checked DB: product_name, unit_price, quantity, discount, ext_price

            const mappedItems = (bill.items || []).map(item => ({
                id: item.id || Date.now() + Math.random(), // Use existing ID for stock tracking? 
                // Wait, backend updateBill deletes all items and inserts new ones.
                // So we just need to send the correct structure back.
                // BUT for stock update, we need to know what the OLD items were.
                // The backend fetches old items from DB before deleting. So we don't need to preserve old IDs for that purpose.
                // We just need to send the "New State" of items.

                item_id: item.item_id, // Important: need item_id (product ID)
                category: item.category,
                productName: item.product_name,
                unitPrice: item.unit_price,
                quantity: item.quantity,
                discount: item.discount,
                extPrice: item.ext_price
            }));
            setBillItems(mappedItems);
        }
    }, [bill]);

    const handleSubTabChange = (event, newValue) => {
        setSubTabValue(newValue);
    };

    const handleAddItem = (item) => {
        setBillItems([...billItems, { ...item, id: Date.now() }]);
    };

    const handleDeleteItemClick = (index) => {
        setItemIndexToDelete(index);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemIndexToDelete !== null) {
            setBillItems(billItems.filter((_, index) => index !== itemIndexToDelete));
        }
        setDeleteDialogOpen(false);
        setItemIndexToDelete(null);
    };

    const handleQuantityChange = (index, newQty) => {
        const updatedItems = [...billItems];
        const item = updatedItems[index];
        const qty = parseFloat(newQty);

        if (qty > 0) {
            item.quantity = qty;
            item.extPrice = ((qty * item.unitPrice) - (item.discount || 0)).toFixed(2);
            setBillItems(updatedItems);
        }
    };

    const handleCustomerChange = (e) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    // Calculate Totals
    const totalPrice = billItems.reduce((sum, item) => sum + (Number(item.extPrice) || 0) + (Number(item.discount) || 0), 0);
    const discountAmount = billItems.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
    const netPrice = totalPrice - discountAmount;

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        const billData = {
            customer_name: customerDetails.name,
            customer_address: customerDetails.address,
            customer_phone: customerDetails.phone,
            total_price: totalPrice,
            discount_amount: discountAmount,
            net_price: netPrice
        };

        try {
            const res = await fetch(`${API_URL}/bills/${bill.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ billData, items: billItems })
            });

            if (res.ok) {
                toast.success('Bill updated successfully');
                onUpdate();
                onClose();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to update bill');
            }
        } catch (err) {
            console.error('Error updating bill:', err);
            toast.error('Error updating bill');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: '#f0f0f0', fontWeight: 'bold' }}>Edit Bill #{bill?.bill_number}</DialogTitle>
            <DialogContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, height: '70vh' }}>

                    {/* Left Side: Add Items */}
                    <Box sx={{ width: '40%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Add Items</Typography>
                        <Tabs value={subTabValue} onChange={handleSubTabChange} variant="fullWidth" sx={{ mb: 2 }}>
                            <SubTab label="Equip" />
                            <SubTab label="Paddy" />
                            <SubTab label="Chem" />
                        </Tabs>
                        {subTabValue === 0 && <EquipmentForm onAdd={handleAddItem} />}
                        {subTabValue === 1 && <PaddyForm onAdd={handleAddItem} />}
                        {subTabValue === 2 && <ChemicalsForm onAdd={handleAddItem} />}
                    </Box>

                    {/* Right Side: Bill Details & List */}
                    <Box sx={{ width: '60%', pl: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Bill Details</Typography>

                        {/* Customer Form */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Name" name="name" value={customerDetails.name} onChange={handleCustomerChange} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Phone" name="phone" value={customerDetails.phone} onChange={handleCustomerChange} size="small" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Address" name="address" value={customerDetails.address} onChange={handleCustomerChange} size="small" />
                            </Grid>
                        </Grid>

                        {/* Items Table */}
                        <Box sx={{ flex: 1, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
                            {billItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 1, borderBottom: '1px solid #eee', bgcolor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    <Box sx={{ flex: 2 }}>
                                        <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                                        <Typography variant="caption" color="textSecondary">Price: {item.unitPrice}</Typography>
                                    </Box>
                                    <Box sx={{ width: '80px', mx: 1 }}>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            inputProps={{ min: 1, style: { padding: '5px' } }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: 'right', mr: 2 }}>
                                        <Typography variant="body2" fontWeight="bold">{item.extPrice}</Typography>
                                    </Box>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteItemClick(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        {/* Totals */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '5px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Total:</Typography>
                                <Typography>{totalPrice.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Discount:</Typography>
                                <Typography>{discountAmount.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography fontWeight="bold">Net Price:</Typography>
                                <Typography fontWeight="bold" color="primary">{netPrice.toFixed(2)}</Typography>
                            </Box>
                        </Box>

                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Save Changes</Button>
            </DialogActions>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Item"
                content="Are you sure you want to remove this item from the bill?"
            />
        </Dialog>
    );
};

export default EditBillDialog;
