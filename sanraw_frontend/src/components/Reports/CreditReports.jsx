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
    backgroundColor: '#fff3e0', // Light orange for credit
    color: '#e65100',
});

const CreditReports = () => {
    const [credits, setCredits] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/reports/credit-report`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCredits(data);
                setFiltered(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch credit report");
        }
    };

    useEffect(() => {
        const result = credits.filter(item =>
            item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            (item.customer_phone && item.customer_phone.includes(search))
        );
        setFiltered(result);
    }, [search, credits]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Customer Credit Report", 14, 20);

        // Add Summary Stats
        const totalOutstanding = filtered.reduce((acc, curr) => acc + Number(curr.total_credit), 0);
        const totalDebtors = filtered.length;

        doc.setFontSize(10);
        doc.text(`Total Outstanding Credit: Rs. ${totalOutstanding.toLocaleString()}`, 14, 28);
        doc.text(`Total Debtors: ${totalDebtors}`, 14, 34);
        doc.setFontSize(12);

        const tableColumn = ["Customer Name", "Phone", "Pending Bills", "Total Credit (Rs)", "Last Updated"];
        const tableRows = filtered.map(item => [
            item.customer_name,
            item.customer_phone || 'N/A',
            item.bill_count,
            Number(item.total_credit).toFixed(2),
            new Date(item.last_updated).toLocaleDateString()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save("Credit_Report.pdf");
    };

    const exportExcel = () => {
        const totalOutstanding = filtered.reduce((acc, curr) => acc + Number(curr.total_credit), 0);
        const totalDebtors = filtered.length;

        // Prepare Data for Excel (Array of Arrays)
        const summaryRows = [
            ["Credit Report Summary"],
            ["Total Outstanding Credit", `Rs. ${totalOutstanding}`],
            ["Total Debtors", totalDebtors],
            [], // Empty row
            ["Customer Name", "Phone", "Pending Bills", "Total Credit", "Last Updated"] // Headers
        ];

        const dataRows = filtered.map(item => [
            item.customer_name,
            item.customer_phone,
            item.bill_count,
            Number(item.total_credit),
            new Date(item.last_updated).toLocaleDateString()
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...summaryRows, ...dataRows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Credit");
        XLSX.writeFile(wb, "Credit_Report.xlsx");
    };

    // Calculate Totals
    const totalOutstanding = filtered.reduce((acc, curr) => acc + Number(curr.total_credit), 0);
    const totalDebtors = filtered.length;

    return (
        <Box>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#fff3e0' }}>
                    <Typography variant="subtitle2" color="warning.dark">Total Outstanding Credit</Typography>
                    <Typography variant="h4" fontWeight="bold">Rs. {totalOutstanding.toLocaleString()}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" color="primary.main">Total Debtors</Typography>
                    <Typography variant="h4" fontWeight="bold">{totalDebtors}</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6">Customer Credit Report</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search Name/Phone"
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
                            <StyledTableCell>Customer Name</StyledTableCell>
                            <StyledTableCell>Phone</StyledTableCell>
                            <StyledTableCell>Pending Bills</StyledTableCell>
                            <StyledTableCell>Total Credit</StyledTableCell>
                            <StyledTableCell>Last Updated</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((row, idx) => (
                            <TableRow key={idx} hover>
                                <TableCell>{row.customer_name}</TableCell>
                                <TableCell>{row.customer_phone || 'N/A'}</TableCell>
                                <TableCell>{row.bill_count}</TableCell>
                                <TableCell>Rs. {Number(row.total_credit).toFixed(2)}</TableCell>
                                <TableCell>{new Date(row.last_updated).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CreditReports;
