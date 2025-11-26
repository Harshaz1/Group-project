import React, { useState } from 'react';
import { Box, Tabs, Tab, Button, Typography, Grid, Select, MenuItem, TextField } from '@mui/material';
import { styled } from '@mui/system';
import EquipmentForm from './forms/EquipmentForm';
import ChemicalsForm from './forms/ChemicalsForm';
import PaddyForm from './forms/PaddyForm';
import BillTable from './BillTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SubTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    flex: 1,
    color: '#aaa',
    '&.Mui-selected': {
        color: '#4CAF50',
        borderBottom: '2px solid #4CAF50'
    },
});

const SellsTab = () => {
    const [subTabValue, setSubTabValue] = useState(0);
    const [billItems, setBillItems] = useState([]);

    // New States
    const [customerDetails, setCustomerDetails] = useState({ name: '', address: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const handleSubTabChange = (event, newValue) => {
        setSubTabValue(newValue);
    };

    const handleAddItem = (item) => {
        setBillItems([...billItems, { ...item, id: Date.now() }]);
    };

    const handleDelete = (id) => {
        setBillItems(billItems.filter(item => item.id !== id));
    };

    const handleCustomerChange = (e) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    // Calculate Totals
    const totalPrice = billItems.reduce((sum, item) => sum + (Number(item.extPrice) || 0) + (Number(item.discount) || 0), 0);
    const discountAmount = billItems.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
    const netPrice = totalPrice - discountAmount;

    const saveBillToBackend = async () => {
        const token = localStorage.getItem('token');
        const billNumber = `BILL-${Date.now()}`;

        const billData = {
            bill_number: billNumber,
            customer_name: customerDetails.name,
            customer_address: customerDetails.address,
            customer_phone: customerDetails.phone,
            payment_type: paymentMethod,
            total_price: totalPrice,
            discount_amount: discountAmount,
            net_price: netPrice
        };

        try {
            const res = await fetch(`${API_URL}/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ billData, items: billItems })
            });

            if (res.ok) {
                console.log('Bill saved to database');
            } else {
                console.error('Failed to save bill');
            }
        } catch (err) {
            console.error('Error saving bill:', err);
        }
    };

    const handleGenerateBill = async () => {
        if (billItems.length === 0) return toast.warning("No items in bill");

        // ONLY validate customer name if payment method is CREDIT
        if (paymentMethod === 'credit' && !customerDetails.name) {
            return toast.warning("Customer Name is required for Credit sales");
        }

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("SANRAW Agriculture", 14, 20);

        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        if (customerDetails.name) doc.text(`Bill To: ${customerDetails.name}`, 14, 35);
        if (customerDetails.address) doc.text(`Address: ${customerDetails.address}`, 14, 40);
        if (customerDetails.phone) doc.text(`Phone: ${customerDetails.phone}`, 14, 45);
        doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 14, 55);

        // Table
        const tableColumn = ["No.", "Product Name", "Unit Price", "Qty", "Ext Price"];
        const tableRows = [];

        billItems.forEach((item, index) => {
            const row = [
                index + 1,
                item.productName,
                item.unitPrice,
                item.quantity,
                item.extPrice
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Price: ${totalPrice.toFixed(2)}`, 14, finalY);
        doc.text(`Discount: -${discountAmount.toFixed(2)}`, 14, finalY + 6);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Net Price: ${netPrice.toFixed(2)}`, 14, finalY + 14);

        doc.save(`bill_${Date.now()}.pdf`);

        // Save to backend
        await saveBillToBackend();

        toast.success("Bill downloaded and saved");

        // Clear bill items and customer details
        setBillItems([]);
        setCustomerDetails({ name: '', address: '', phone: '' });
    };

    return (
        <Box>
            {/* Sub Tabs Line */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, width: '60%', mx: 'auto' }}>
                <Tabs value={subTabValue} onChange={handleSubTabChange} centered>
                    <SubTab label="Equipment" />
                    <SubTab label="Paddy" />
                    <SubTab label="Chemicals" />
                </Tabs>
            </Box>

            {/* Forms */}
            <Box sx={{ mb: 4 }}>
                {subTabValue === 0 && <EquipmentForm onAdd={handleAddItem} />}
                {subTabValue === 1 && <PaddyForm onAdd={handleAddItem} />}
                {subTabValue === 2 && <ChemicalsForm onAdd={handleAddItem} />}
            </Box>

            {/* Table Area */}
            <BillTable items={billItems} onDelete={handleDelete} />

            {/* Footer Totals & Actions */}
            <Box sx={{ mt: 4, px: 2 }}>
                <Grid container spacing={2} justifyContent="flex-end">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontWeight="bold">Total Price:</Typography>
                            <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', px: 1, minWidth: '100px', textAlign: 'right' }}>
                                {totalPrice.toFixed(2)}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontWeight="bold">Discount:</Typography>
                            <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', px: 1, minWidth: '100px', textAlign: 'right', bgcolor: '#f5f5f5' }}>
                                {discountAmount.toFixed(2)}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontWeight="bold">Net Price:</Typography>
                            <Box sx={{ border: '1px solid #ccc', borderRadius: '5px', px: 1, minWidth: '100px', textAlign: 'right' }}>
                                {netPrice.toFixed(2)}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 4, mb: 4 }}>

                    {/* Payment Method */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography fontWeight="bold" sx={{ color: '#4CAF50', fontSize: '1.2rem' }}>Select Payment Method:</Typography>
                        <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            sx={{
                                borderRadius: '20px',
                                border: '2px solid #98FB98',
                                color: '#333',
                                fontWeight: 'bold',
                                minWidth: '200px',
                                '& .MuiSelect-select': { py: 1 }
                            }}
                        >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="credit">Credit</MenuItem>
                        </Select>
                    </Box>

                    {/* Customer Details Form */}
                    <Box sx={{ width: '100%', maxWidth: '900px', border: '1px solid #e0e0e0', borderRadius: '10px', p: 3, bgcolor: '#f9f9f9', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50', textAlign: 'center' }}>Customer Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Customer Name" name="name" value={customerDetails.name} onChange={handleCustomerChange} size="small" variant="outlined" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Customer Address" name="address" value={customerDetails.address} onChange={handleCustomerChange} size="small" variant="outlined" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Customer Phone" name="phone" value={customerDetails.phone} onChange={handleCustomerChange} size="small" variant="outlined" />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Buttons */}
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Button
                            variant="contained"
                            onClick={handleGenerateBill}
                            sx={{ bgcolor: '#98FB98', color: '#070606c5', borderRadius: '25px', px: 6, fontWeight: 'bold', '&:hover': { bgcolor: '#7ddba4' } }}
                        >
                            Print Bill
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default SellsTab;
