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
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
});

const SalesReports = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchSales();
    }, [startDate, endDate]);

    const fetchSales = async () => {
        const token = localStorage.getItem('token');
        try {
            let url = `${API_URL}/reports/monthly-sales`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSales(data);
                setFilteredSales(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch sales report");
        }
    };

    useEffect(() => {
        const result = sales.filter(item =>
            item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            item.bill_number.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredSales(result);
    }, [search, sales]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Sales Report", 14, 20);

        let subTitleY = 28;
        if (startDate && endDate) {
            doc.text(`Period: ${startDate} to ${endDate}`, 14, subTitleY);
            subTitleY += 8;
        } else {
            doc.text(`Period: This Month`, 14, subTitleY);
            subTitleY += 8;
        }

        // Add Summary Stats
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((acc, curr) => acc + Number(curr.net_price), 0);
        const totalPending = filteredSales.filter(x => !x.is_paid).reduce((acc, curr) => acc + Number(curr.net_price), 0);

        doc.setFontSize(10);
        doc.text(`Total Sales Count: ${totalSales}`, 14, subTitleY);
        doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 80, subTitleY);
        doc.text(`Pending Payment: Rs. ${totalPending.toLocaleString()}`, 150, subTitleY);

        doc.setFontSize(12);

        const tableColumn = ["Date", "Bill No", "Customer", "Payment", "Net Price", "Status"];
        const tableRows = filteredSales.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.bill_number,
            item.customer_name,
            item.payment_type,
            `Rs. ${Number(item.net_price).toFixed(2)}`,
            item.is_paid ? "Paid" : "Unpaid"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: subTitleY + 10,
        });

        doc.save("Sales_Report.pdf");
    };

    const exportExcel = () => {
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((acc, curr) => acc + Number(curr.net_price), 0);
        const totalPending = filteredSales.filter(x => !x.is_paid).reduce((acc, curr) => acc + Number(curr.net_price), 0);

        // Prepare Data for Excel (Array of Arrays)
        const summaryRows = [
            ["Sales Report Summary"],
            ["Period", startDate && endDate ? `${startDate} to ${endDate}` : "This Month"],
            ["Total Sales Count", totalSales],
            ["Total Revenue", `Rs. ${totalRevenue}`],
            ["Pending Payment", `Rs. ${totalPending}`],
            [], // Empty row
            ["Date", "Bill Number", "Customer", "Payment Type", "Net Price", "Status"] // Headers
        ];

        const dataRows = filteredSales.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.bill_number,
            item.customer_name,
            item.payment_type,
            Number(item.net_price),
            item.is_paid ? "Paid" : "Unpaid"
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...summaryRows, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales");
        XLSX.writeFile(wb, "Sales_Report.xlsx");
    };

    return (
        <Box>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e8f5e9' }}>
                    <Typography variant="subtitle2" color="success.main">Total Sales Count</Typography>
                    <Typography variant="h4" fontWeight="bold">{filteredSales.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" color="primary.main">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {filteredSales.reduce((acc, curr) => acc + Number(curr.net_price), 0).toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#fff3e0' }}>
                    <Typography variant="subtitle2" color="warning.main">Pending Payment</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {filteredSales.filter(x => !x.is_paid).reduce((acc, curr) => acc + Number(curr.net_price), 0).toLocaleString()}</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">Sales Report</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Bill Number</StyledTableCell>
                            <StyledTableCell>Customer</StyledTableCell>
                            <StyledTableCell>Payment Type</StyledTableCell>
                            <StyledTableCell>Net Price</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSales.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{row.bill_number}</TableCell>
                                <TableCell>{row.customer_name}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.payment_type}</TableCell>
                                <TableCell>Rs. {row.net_price}</TableCell>
                                <TableCell sx={{ color: row.is_paid ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {row.is_paid ? "Paid" : "Unpaid"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SalesReports;
