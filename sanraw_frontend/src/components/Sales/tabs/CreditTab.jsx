import React, { useState, useEffect } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination, TextField, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Typography, Tooltip, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EditBillDialog from '../forms/EditBillDialog';
import ConfirmationDialog from '../../common/ConfirmationDialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StyledTableCell = styled(TableCell)({
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#81c784',
    textAlign: 'center',
    borderRight: '1px solid #fff'
});

const CreditTab = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedBill, setSelectedBill] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [billToEdit, setBillToEdit] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role || '');
        fetchBills();
    }, []);

    const fetchBills = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bills/payment/credit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBills(data);
                setFilteredBills(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const filtered = bills.filter(bill =>
            bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBills(filtered);
        setPage(0);
    }, [searchTerm, bills]);

    const handleExpandBill = async (billId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bills/${billId}`, {
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

    const handleEditBill = async (billId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bills/${billId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBillToEdit(data);
                setEditDialogOpen(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error fetching bill details");
        }
    };

    const handleDownloadBill = async (billId) => {
        const token = localStorage.getItem('token');
        try {
            // Fetch full bill details with items
            const res = await fetch(`${API_URL}/bills/${billId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) return toast.error("Failed to fetch bill data");

            const bill = await res.json();

            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.text("SANRAW Agriculture", 14, 20);

            doc.setFontSize(10);
            doc.text(`Bill No: ${bill.bill_number}`, 14, 30);
            doc.text(`Date: ${new Date(bill.created_at).toLocaleDateString()}`, 14, 35);
            doc.text(`Bill To: ${bill.customer_name}`, 14, 45);
            doc.text(`Address: ${bill.customer_address}`, 14, 50);
            doc.text(`Phone: ${bill.customer_phone}`, 14, 55);

            // Table
            const tableColumn = ["Product", "Qty", "Unit Price", "Discount", "Total"];
            const tableRows = bill.items.map(item => [
                item.product_name,
                item.quantity,
                item.unit_price,
                item.discount,
                item.ext_price
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 65,
            });

            // Totals
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.text(`Total Price: ${Number(bill.total_price).toFixed(2)}`, 14, finalY);
            doc.text(`Discount: -${Number(bill.discount_amount).toFixed(2)}`, 14, finalY + 6);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`Net Price: ${Number(bill.net_price).toFixed(2)}`, 14, finalY + 14);

            // Payment Status
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const status = bill.is_paid ? "PAID" : "UNPAID";
            doc.text(`Status: ${status}`, 14, finalY + 22);

            doc.save(`${bill.bill_number}.pdf`);
            toast.success("Bill downloaded");

        } catch (err) {
            console.error(err);
            toast.error("Error generating PDF");
        }
    };

    const handleDeleteClick = (billId) => {
        setBillToDelete(billId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!billToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bills/${billToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Bill deleted');
                fetchBills();
            } else {
                toast.error('Failed to delete bill');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error deleting bill');
        } finally {
            setDeleteDialogOpen(false);
            setBillToDelete(null);
        }
    };

    const handleMarkAsPaid = async (billId, currentStatus) => {
        if (currentStatus) {
            toast.info('Bill is already marked as paid');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/bills/${billId}/payment-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_paid: true })
            });
            if (res.ok) {
                toast.success('Bill marked as paid');
                fetchBills();
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error updating status');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                    label="Search by Customer Name"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px' }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Bill Number</StyledTableCell>
                            <StyledTableCell>Customer Name</StyledTableCell>
                            <StyledTableCell>Total Price</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell sx={{ borderRight: 'none' }}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((bill) => (
                            <TableRow
                                key={bill.id}
                                sx={{
                                    backgroundColor: bill.is_paid ? '#e8f5e9' : '#ffebee', // Green if paid, Red if unpaid
                                    '&:hover': { backgroundColor: bill.is_paid ? '#c8e6c9' : '#ffcdd2' }
                                }}
                            >
                                <TableCell align="center">{bill.bill_number}</TableCell>
                                <TableCell align="center">{bill.customer_name}</TableCell>
                                <TableCell align="center">Rs. {bill.net_price}</TableCell>
                                <TableCell align="center">{new Date(bill.created_at).toLocaleDateString()}</TableCell>
                                <TableCell align="center">
                                    {bill.is_expired ? (
                                        <Chip label="EXPIRED" color="error" size="small" />
                                    ) : (
                                        <Chip label="ACTIVE" color="success" size="small" />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton onClick={() => handleExpandBill(bill.id)} color="primary" size="small">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Download PDF">
                                        <IconButton onClick={() => handleDownloadBill(bill.id)} color="info" size="small">
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={bill.is_expired ? "Bill Expired" : "Edit Bill"}>
                                        <span>
                                            <IconButton
                                                onClick={() => handleEditBill(bill.id)}
                                                color="warning"
                                                size="small"
                                                disabled={Boolean(bill.is_expired)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    {!bill.is_paid && (
                                        <Tooltip title="Mark as Paid">
                                            <IconButton onClick={() => handleMarkAsPaid(bill.id, bill.is_paid)} color="success" size="small">
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {userRole === 'owner' && (
                                        <Tooltip title={bill.is_expired ? "Bill Expired" : "Delete"}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(bill.id)}
                                                    color="error"
                                                    size="small"
                                                    disabled={Boolean(bill.is_expired)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
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
                <DialogTitle>Bill Details</DialogTitle>
                <DialogContent>
                    {selectedBill && (
                        <Box>
                            <Typography><strong>Bill Number:</strong> {selectedBill.bill_number}</Typography>
                            <Typography><strong>Customer:</strong> {selectedBill.customer_name}</Typography>
                            <Typography><strong>Address:</strong> {selectedBill.customer_address}</Typography>
                            <Typography><strong>Phone:</strong> {selectedBill.customer_phone}</Typography>
                            <Typography><strong>Payment Type:</strong> {selectedBill.payment_type}</Typography>
                            <Typography sx={{ mt: 2, mb: 1 }}><strong>Items:</strong></Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Discount</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedBill.items?.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.unit_price}</TableCell>
                                            <TableCell>{item.discount}</TableCell>
                                            <TableCell>{item.ext_price}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Typography sx={{ mt: 2 }}><strong>Total:</strong> Rs. {selectedBill.total_price}</Typography>
                            <Typography><strong>Discount:</strong> Rs. {selectedBill.discount_amount}</Typography>
                            <Typography><strong>Net Price:</strong> Rs. {selectedBill.net_price}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Bill Dialog */}
            <EditBillDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                bill={billToEdit}
                onUpdate={fetchBills}
            />

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Bill"
                content="Are you sure you want to delete this bill? This action cannot be undone."
            />
        </Box>
    );
};

export default CreditTab;
