import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Button, Typography, Grid, Select, MenuItem, TextField, FormControl, InputLabel, IconButton, Paper, Divider } from '@mui/material';
import { styled } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SupplierDialog from './SupplierDialog';
import BillTable from '../BillTable';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SubTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    flex: 1,
    color: '#aaa',
    '&.Mui-selected': {
        color: '#2196F3', // blue for buy
        borderBottom: '2px solid #2196F3'
    },
});

const BuyTab = () => {
    const [subTabValue, setSubTabValue] = useState(0); // 0: Paddy, 1: Equipment, 2: Chemicals
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [purchaseItems, setPurchaseItems] = useState([]);

    // Item selection states
    const [inventoryItems, setInventoryItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');

    // Dialog state
    const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        fetchInventoryItems();
    }, [subTabValue]);

    const fetchSuppliers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/suppliers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSuppliers(await res.json());
        } catch (err) {
            console.error(err);
            toast.error("Error fetching suppliers");
        }
    };

    const fetchInventoryItems = async () => {
        const token = localStorage.getItem('token');
        let endpoint = '';
        if (subTabValue === 0) endpoint = '/paddy';
        else if (subTabValue === 1) endpoint = '/equipment';
        else if (subTabValue === 2) endpoint = '/chemicals';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setInventoryItems(await res.json());
        } catch (err) {
            console.error(err);
            toast.error("Error fetching items");
        }
    };

    const handleAddItem = () => {
        if (!selectedItemId || !quantity || !buyPrice) {
            return toast.error("Please fill all item fields");
        }

        const item = inventoryItems.find(i => i.id === selectedItemId);
        if (!item) return;

        const qty = parseFloat(quantity);
        const price = parseFloat(buyPrice);
        const extPrice = (qty * price).toFixed(2);

        const category = subTabValue === 0 ? 'paddy' : subTabValue === 1 ? 'equipment' : 'fertilizer_pesticide';
        const productName = item.paddy_name || item.equipment_name || item.name;

        setPurchaseItems([...purchaseItems, {
            id: Date.now(), // for UI list
            item_id: item.id,
            category,
            productName,
            quantity: qty,
            unitPrice: price, // this is the buy price for display
            extPrice
        }]);

        // Reset
        setSelectedItemId('');
        setQuantity('');
        setBuyPrice('');
    };

    const handleDeleteItem = (id) => {
        setPurchaseItems(purchaseItems.filter(item => item.id !== id));
    };

    const handlePurchaseSubmit = async () => {
        if (!selectedSupplierId) return toast.warning("Please select a supplier");
        if (purchaseItems.length === 0) return toast.warning("No items in purchase");

        const token = localStorage.getItem('token');
        const billNumber = `P-BILL-${Date.now()}`;
        const totalPrice = purchaseItems.reduce((acc, curr) => acc + parseFloat(curr.extPrice), 0);

        const purchaseData = {
            bill_number: billNumber,
            supplier_id: selectedSupplierId,
            payment_type: paymentMethod,
            total_price: totalPrice,
            net_price: totalPrice
        };

        // Format items for backend
        const formattedItems = purchaseItems.map(item => ({
            item_id: item.item_id,
            category: item.category,
            product_name: item.productName,
            quantity: item.quantity,
            buy_price: item.unitPrice,
            ext_price: item.extPrice
        }));

        try {
            const res = await fetch(`${API_URL}/purchases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ purchaseData, items: formattedItems })
            });

            if (res.ok) {
                toast.success("Purchase recorded and stock updated!");
                generatePDF(billNumber, totalPrice);
                setPurchaseItems([]);
                setSelectedSupplierId('');
            } else {
                toast.error("Failed to record purchase");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error submitting purchase");
        }
    };

    const generatePDF = (billNo, total) => {
        const doc = new jsPDF();
        const supplier = suppliers.find(s => s.id === selectedSupplierId);

        doc.setFontSize(18);
        doc.text("SANRAW Agriculture - Purchase Bill", 14, 20);

        doc.setFontSize(10);
        doc.text(`Bill Number: ${billNo}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
        if (supplier) {
            doc.text(`Supplier: ${supplier.name}`, 14, 45);
            doc.text(`Address: ${supplier.address || '-'}`, 14, 50);
            doc.text(`Phone: ${supplier.phone || '-'}`, 14, 55);
        }
        doc.text(`Payment: ${paymentMethod.toUpperCase()}`, 14, 65);

        const tableColumn = ["Product", "Qty", "Buy Price", "Subtotal"];
        const tableRows = purchaseItems.map(item => [
            item.productName,
            item.quantity,
            item.unitPrice.toFixed(2),
            item.extPrice
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount: Rs. ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, finalY);

        doc.save(`${billNo}.pdf`);
    };

    return (
        <Box>
            {/* Supplier Selection Area */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: '15px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>Step 1: Supplier Information</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Supplier</InputLabel>
                            <Select
                                value={selectedSupplierId}
                                label="Select Supplier"
                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                            >
                                <MenuItem value="" disabled>Choose a supplier...</MenuItem>
                                {suppliers.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.name} - {s.phone}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<AddCircleIcon />}
                            onClick={() => setSupplierDialogOpen(true)}
                            sx={{ borderRadius: '10px' }}
                        >
                            Add New Supplier
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Item Addition Area */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: '15px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>Step 2: Add Items to Purchase</Typography>
                <Tabs value={subTabValue} onChange={(e, v) => setSubTabValue(v)} centered sx={{ mb: 2 }}>
                    <SubTab label="Paddy" />
                    <SubTab label="Equipment" />
                    <SubTab label="Chemicals" />
                </Tabs>

                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Item</InputLabel>
                            <Select
                                value={selectedItemId}
                                label="Select Item"
                                onChange={(e) => setSelectedItemId(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {inventoryItems.map(item => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.paddy_name || item.equipment_name || item.name} (Stock: {item.stock})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buy Price"
                            type="number"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleAddItem}
                            sx={{ borderRadius: '10px', bgcolor: 'primary.main' }}
                        >
                            Add
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Purchase Bill Table */}
            <BillTable items={purchaseItems} onDelete={handleDeleteItem} />

            {/* Final Actions */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: '15px' }}>
                <Grid container spacing={3} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">
                            Total: Rs. {purchaseItems.reduce((acc, curr) => acc + parseFloat(curr.extPrice), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                value={paymentMethod}
                                label="Payment Method"
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <MenuItem value="cash">Cash</MenuItem>
                                <MenuItem value="credit">Credit (To Supplier)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            onClick={handlePurchaseSubmit}
                            sx={{ borderRadius: '25px', fontWeight: 'bold' }}
                        >
                            Submit Purchase & Print
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <SupplierDialog
                open={supplierDialogOpen}
                onClose={() => setSupplierDialogOpen(false)}
                onSave={(newSupplier) => {
                    setSuppliers([...suppliers, newSupplier]);
                    setSelectedSupplierId(newSupplier.id);
                }}
            />
        </Box>
    );
};

export default BuyTab;
