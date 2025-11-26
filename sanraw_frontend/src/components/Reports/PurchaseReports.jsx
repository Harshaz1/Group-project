import React, { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StyledTableCell = styled(TableCell)({
    fontWeight: 'bold',
    backgroundColor: '#fce4ec', // Light pink
    color: '#880e4f',
});

const PurchaseReports = () => {
    const [purchases, setPurchases] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, [startDate, endDate]);

    const fetchPurchases = async () => {
        const token = localStorage.getItem('token');
        try {
            let url = `${API_URL}/reports/inventory-purchase-report`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
                setFiltered(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch purchase report");
        }
    };

    useEffect(() => {
        let result = purchases;
        if (category !== 'all') {
            result = result.filter(item => item.category === category);
        }
        setFiltered(result);
    }, [category, purchases]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Inventory Purchase Report", 14, 20);

        const totalCost = filtered.reduce((acc, curr) => acc + Number(curr.buy_price * curr.quantity), 0);

        doc.setFontSize(10);
        doc.text(`Total Purchase Cost: Rs. ${totalCost.toLocaleString()}`, 14, 28);
        if (startDate && endDate) {
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);
        }
        doc.setFontSize(12);

        const tableColumn = ["Date", "Category", "Quantity", "Buy Price (Rs)", "Total Cost (Rs)", "Payment"];
        const tableRows = filtered.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.category,
            item.quantity,
            Number(item.buy_price).toFixed(2),
            Number(item.buy_price * item.quantity).toFixed(2),
            item.payment_type
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save("Purchase_Report.pdf");
    };

    const exportExcel = () => {
        const totalCost = filtered.reduce((acc, curr) => acc + (Number(curr.buy_price) * Number(curr.quantity)), 0);

        const summaryRows = [
            ["Inventory Purchase Report Summary"],
            ["Total Purchase Cost", `Rs. ${totalCost}`],
            ["Period", startDate && endDate ? `${startDate} to ${endDate}` : "All Time"],
            [],
            ["Date", "Category", "Quantity", "Buy Price", "Total Cost", "Payment Type"]
        ];

        const dataRows = filtered.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.category,
            item.quantity,
            Number(item.buy_price),
            Number(item.buy_price) * Number(item.quantity),
            item.payment_type
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...summaryRows, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Purchases");
        XLSX.writeFile(wb, "Purchase_Report.xlsx");
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#fce4ec' }}>
                    <Typography variant="subtitle2" color="error.dark">Total Purchase Cost</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {filtered.reduce((acc, curr) => acc + (Number(curr.buy_price) * Number(curr.quantity)), 0).toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" color="primary.main">Purchase Count</Typography>
                    <Typography variant="h4" fontWeight="bold">{filtered.length}</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">Purchase History</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            <MenuItem value="paddy">Paddy</MenuItem>
                            <MenuItem value="equipment">Equipment</MenuItem>
                            <MenuItem value="fertilizer_pesticide">Chemicals</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <TextField
                        type="date"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button variant="contained" color="success" startIcon={<FileDownloadIcon />} onClick={exportExcel}>
                        Excel
                    </Button>
                    <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={exportPDF}>
                        PDF
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Category</StyledTableCell>
                            <StyledTableCell>Quantity</StyledTableCell>
                            <StyledTableCell>Buy Price</StyledTableCell>
                            <StyledTableCell>Total Cost</StyledTableCell>
                            <StyledTableCell>Payment</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((row, idx) => (
                            <TableRow key={idx} hover>
                                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.category.replace('_', ' ')}</TableCell>
                                <TableCell>{row.quantity}</TableCell>
                                <TableCell>Rs. {row.buy_price}</TableCell>
                                <TableCell>Rs. {Number(row.buy_price * row.quantity).toFixed(2)}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.payment_type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PurchaseReports;
