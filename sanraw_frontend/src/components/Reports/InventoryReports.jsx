import React, { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, TextField } from '@mui/material';
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
    backgroundColor: '#e1f5fe', // Light blue for inventory
    color: '#0277bd',
});

const InventoryReports = () => {
    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/reports/inventory-report`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
                setFiltered(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch inventory report");
        }
    };

    useEffect(() => {
        const result = items.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [search, items]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Inventory Status Report", 14, 20);

        // Add Summary Stats
        const totalValue = filtered.reduce((acc, curr) => acc + Number(curr.value), 0);
        const totalItems = filtered.length;
        const lowStockCount = filtered.filter(item => item.stock < 10).length;

        doc.setFontSize(10);
        doc.text(`Total Inventory Value: Rs. ${totalValue.toLocaleString()}`, 14, 28);
        doc.text(`Total Items: ${totalItems}`, 14, 34);
        doc.text(`Low Stock Items: ${lowStockCount}`, 14, 40);
        doc.setFontSize(12);

        const tableColumn = ["Item Name", "Category", "Stock Level", "Unit Price", "Total Value"];
        const tableRows = filtered.map(item => [
            item.name,
            item.category,
            item.stock,
            `Rs. ${Number(item.price).toFixed(2)}`,
            `Rs. ${Number(item.value).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
        });

        doc.save("Inventory_Report.pdf");
    };

    const exportExcel = () => {
        const totalValue = filtered.reduce((acc, curr) => acc + Number(curr.value), 0);
        const totalItems = filtered.length;
        const lowStockCount = filtered.filter(item => item.stock < 10).length;

        // Prepare Data for Excel (Array of Arrays)
        const summaryRows = [
            ["Inventory Report Summary"],
            ["Total Inventory Value", `Rs. ${totalValue}`],
            ["Total Items", totalItems],
            ["Low Stock Items", lowStockCount],
            [], // Empty row
            ["Item Name", "Category", "Stock Level", "Unit Price", "Total Value"] // Headers
        ];

        const dataRows = filtered.map(item => [
            item.name,
            item.category,
            item.stock,
            Number(item.price),
            Number(item.value)
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...summaryRows, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, "Inventory_Report.xlsx");
    };

    // Calculate Totals
    const totalValue = filtered.reduce((acc, curr) => acc + Number(curr.value), 0);
    const totalItems = filtered.length;
    const lowStockCount = filtered.filter(item => item.stock < 10).length;

    return (
        <Box>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e1f5fe' }}>
                    <Typography variant="subtitle2" color="info.main">Total Inventory Value</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {totalValue.toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#f3e5f5' }}>
                    <Typography variant="subtitle2" color="secondary.main">Total Items</Typography>
                    <Typography variant="h4" fontWeight="bold">{totalItems}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#ffebee' }}>
                    <Typography variant="subtitle2" color="error.main">Low Stock Items</Typography>
                    <Typography variant="h4" fontWeight="bold">{lowStockCount}</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6">Current Inventory Status</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                            <StyledTableCell>Item Name</StyledTableCell>
                            <StyledTableCell>Category</StyledTableCell>
                            <StyledTableCell>Stock Level</StyledTableCell>
                            <StyledTableCell>Unit Price</StyledTableCell>
                            <StyledTableCell>Total Value</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((row) => (
                            <TableRow key={row.name + row.category} hover>
                                <TableCell>{row.name}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.category}</TableCell>
                                <TableCell>{row.stock}</TableCell>
                                <TableCell>Rs. {Number(row.price).toFixed(2)}</TableCell>
                                <TableCell>Rs. {Number(row.value).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InventoryReports;
