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
    backgroundColor: '#f1f8e9', // Light green
    color: '#33691e',
});

const CreditPaymentReports = () => {
    const [payments, setPayments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [startDate, endDate]);

    const fetchPayments = async () => {
        const token = localStorage.getItem('token');
        try {
            let url = `${API_URL}/reports/credit-payment-report`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
                setFiltered(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch credit collection report");
        }
    };

    useEffect(() => {
        const result = payments.filter(item =>
            item.customer_nic.toLowerCase().includes(search.toLowerCase()) ||
            `${item.first_name} ${item.last_name}`.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [search, payments]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Credit Collection Report", 14, 20);

        const totalCollected = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);

        doc.setFontSize(10);
        doc.text(`Total Collected: Rs. ${totalCollected.toLocaleString()}`, 14, 28);
        if (startDate && endDate) {
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);
        }
        doc.setFontSize(12);

        const tableColumn = ["Date", "Customer NIC", "Amount (Rs)", "Collected By"];
        const tableRows = filtered.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.customer_nic,
            Number(item.amount).toFixed(2),
            `${item.first_name} ${item.last_name}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save("Credit_Collection_Report.pdf");
    };

    const exportExcel = () => {
        const totalCollected = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);

        const summaryRows = [
            ["Credit Collection Report Summary"],
            ["Total Collected", `Rs. ${totalCollected}`],
            ["Period", startDate && endDate ? `${startDate} to ${endDate}` : "All Time"],
            [],
            ["Date", "Customer NIC", "Amount", "Collected By"]
        ];

        const dataRows = filtered.map(item => [
            new Date(item.created_at).toLocaleDateString(),
            item.customer_nic,
            Number(item.amount),
            `${item.first_name} ${item.last_name}`
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...summaryRows, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Collections");
        XLSX.writeFile(wb, "Credit_Collection_Report.xlsx");
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#f1f8e9' }}>
                    <Typography variant="subtitle2" color="success.dark">Total Credit Collected</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {filtered.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" color="primary.main">Collection Count</Typography>
                    <Typography variant="h4" fontWeight="bold">{filtered.length}</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">Credit Collection History</Typography>
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
                        label="Search NIC/Staff"
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
                            <StyledTableCell>Customer NIC</StyledTableCell>
                            <StyledTableCell>Amount</StyledTableCell>
                            <StyledTableCell>Collected By</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((row, idx) => (
                            <TableRow key={idx} hover>
                                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{row.customer_nic}</TableCell>
                                <TableCell>Rs. {row.amount}</TableCell>
                                <TableCell>{`${row.first_name} ${row.last_name}`}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CreditPaymentReports;
