import React, { useState, useEffect } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination, TextField, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Typography, Chip, Tooltip, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StyledTableCell = styled(TableCell)({
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#64b5f6', // light blue for buy/suppliers
    textAlign: 'center',
    borderRight: '1px solid #fff'
});

const SupplierBillsTab = () => {
    const [subTab, setSubTab] = useState(0); // 0: Cash, 1: Credit
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedBill, setSelectedBill] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchBills();
    }, [subTab]);

    const fetchBills = async () => {
        const token = localStorage.getItem('token');
        const type = subTab === 0 ? 'cash' : 'credit';
        try {
            const res = await fetch(`${API_URL}/purchases?type=${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBills(data);
                setFilteredBills(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load purchase bills");
        }
    };

    useEffect(() => {
        const filtered = bills.filter(bill =>
            bill.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBills(filtered);
        setPage(0);
    }, [searchTerm, bills]);

    const handleExpandBill = async (billId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/purchases/${billId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedBill(data);
                setDialogOpen(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box>
            {/* Sub Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} centered>
                    <Tab label="Cash Bills" sx={{ fontWeight: 'bold' }} />
                    <Tab label="Credit Bills" sx={{ fontWeight: 'bold' }} />
                </Tabs>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                    label="Search by Supplier or Bill #"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px' }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Bill Number</StyledTableCell>
                            <StyledTableCell>Supplier Name</StyledTableCell>
                            <StyledTableCell>Payment Type</StyledTableCell>
                            <StyledTableCell>Net Price</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell sx={{ borderRight: 'none' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill) => (
                            <TableRow key={bill.id} hover>
                                <TableCell align="center">{bill.bill_number}</TableCell>
                                <TableCell align="center">{bill.supplier_name}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={bill.payment_type.toUpperCase()}
                                        color={bill.payment_type === 'cash' ? 'info' : 'secondary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">Rs. {Number(bill.net_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell align="center">{new Date(bill.created_at).toLocaleDateString()}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton onClick={() => handleExpandBill(bill.id)} color="primary" size="small">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={filteredBills.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />

            {/* Bill Details Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>Purchase Bill Details</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedBill && (
                        <Box sx={{ p: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Bill Info</Typography>
                                    <Typography><strong>Number:</strong> {selectedBill.bill_number}</Typography>
                                    <Typography><strong>Date:</strong> {new Date(selectedBill.created_at).toLocaleString()}</Typography>
                                    <Typography><strong>Payment:</strong> {selectedBill.payment_type.toUpperCase()}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Supplier Info</Typography>
                                    <Typography><strong>Name:</strong> {selectedBill.supplier_name}</Typography>
                                    <Typography><strong>Address:</strong> {selectedBill.supplier_address || '-'}</Typography>
                                    <Typography><strong>Phone:</strong> {selectedBill.supplier_phone || '-'}</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography sx={{ mb: 1 }}><strong>Items Purchased:</strong></Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="center">Category</TableCell>
                                        <TableCell align="center">Qty</TableCell>
                                        <TableCell align="right">Buy Price</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedBill.items?.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell align="center" sx={{ textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="right">Rs. {Number(item.buy_price).toFixed(2)}</TableCell>
                                            <TableCell align="right">Rs. {Number(item.ext_price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Box sx={{ minWidth: '200px' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography fontWeight="bold">Grand Total:</Typography>
                                        <Typography fontWeight="bold">Rs. {Number(selectedBill.net_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} variant="contained" color="info">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupplierBillsTab;
