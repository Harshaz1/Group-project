import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Tabs, Tab, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TextField, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Chip, Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../common/ConfirmationDialog';

// --- Styled Components ---
const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    marginTop: theme.spacing(4)
}));

const GreenRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9', // Light green
    '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : '#c8e6c9' }
}));

const NormalRow = styled(TableRow)(({ theme }) => ({
    '&:hover': { backgroundColor: theme.palette.action.hover }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    '&:hover': { backgroundColor: theme.palette.action.hover }
}));

const CustomTab = styled(Tab)(({ theme }) => ({
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1rem',
    '&.Mui-selected': { color: theme.palette.primary.main }
}));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Inventory = () => {
    const navigate = useNavigate();
    const [parentTab, setParentTab] = useState(0); // 0: Stock, 1: Add
    const [categoryTab, setCategoryTab] = useState('paddy'); // paddy, equipment, chemicals

    // Data State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Table State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Add/Edit Form State
    const [formData, setFormData] = useState({
        paddy_name: '', equipment_name: '', name: '',
        price: '', stock: '', expire_date: '' // Unified fields
    });

    // Edit/Delete State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [userRole, setUserRole] = useState('');

    // Get user role on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role || '');
    }, []);



    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        let endpoint = '';
        if (categoryTab === 'paddy') endpoint = '/paddy';
        else if (categoryTab === 'equipment') endpoint = '/equipment';
        else if (categoryTab === 'chemicals') endpoint = '/chemicals';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
            } else {
                toast.error("Failed to fetch inventory");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (parentTab === 0) fetchData();
    }, [categoryTab, parentTab]);

    // --- Search Filter ---
    const filteredData = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (categoryTab === 'paddy') return item.paddy_name?.toLowerCase().includes(searchLower);
        if (categoryTab === 'equipment') return item.equipment_name?.toLowerCase().includes(searchLower);
        if (categoryTab === 'chemicals') return item.name?.toLowerCase().includes(searchLower);
        return false;
    });

    // --- Pagination ---
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- Add Inventory ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        let endpoint = '';
        if (categoryTab === 'paddy') endpoint = '/paddy';
        else if (categoryTab === 'equipment') endpoint = '/equipment';
        else if (categoryTab === 'chemicals') endpoint = '/chemicals';

        if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
            return toast.error("Price and Stock must be greater than 0");
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Item added successfully!");
                setFormData({ paddy_name: '', equipment_name: '', name: '', price: '', stock: '', expire_date: '' });
            } else {
                toast.error("Failed to add item");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error adding item");
        }
    };

    // --- Edit Inventory ---
    const openEditDialog = (item) => {
        setSelectedItem(item);
        setFormData({
            paddy_name: item.paddy_name || '',
            equipment_name: item.equipment_name || '',
            name: item.name || '',
            price: item.price,
            stock: item.stock,
            expire_date: item.expire_date ? item.expire_date.split('T')[0] : ''
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        const token = localStorage.getItem('token');
        let endpoint = '';
        if (categoryTab === 'paddy') endpoint = `/paddy/${selectedItem.id}`;
        else if (categoryTab === 'equipment') endpoint = `/equipment/${selectedItem.id}`;
        else if (categoryTab === 'chemicals') endpoint = `/chemicals/${selectedItem.id}`;

        if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
            return toast.error("Price and Stock must be greater than 0");
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Item updated!");
                setEditDialogOpen(false);
                fetchData();
            } else {
                toast.error("Failed to update");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating item");
        }
    };

    // --- Delete Inventory ---
    // --- Delete Inventory ---
    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        const token = localStorage.getItem('token');
        let endpoint = '';
        if (categoryTab === 'paddy') endpoint = `/paddy/${itemToDelete.id}`;
        else if (categoryTab === 'equipment') endpoint = `/equipment/${itemToDelete.id}`;
        else if (categoryTab === 'chemicals') endpoint = `/chemicals/${itemToDelete.id}`;

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Item deleted!");
                fetchData();
            } else {
                toast.error("Failed to delete");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting item");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };
    // --- Renderers ---
    const renderTableHead = () => (
        <TableHead>
            <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Price (LKR)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>
                    Stock {categoryTab === 'paddy' ? '(kg)' : ''}
                </TableCell>
                {categoryTab === 'chemicals' && <TableCell style={{ fontWeight: 'bold' }}>Expiry Date</TableCell>}
            </TableRow>
        </TableHead>
    );

    const renderTableBody = () => {
        return filteredData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => {
                const isGreen = row.stock > 0;
                const RowComponent = isGreen ? GreenRow : NormalRow;
                let name = row.paddy_name || row.equipment_name || row.name;

                return (
                    <RowComponent key={row.id}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>
                            <Chip
                                label={row.stock}
                                color={row.stock > 0 ? "success" : "error"}
                                variant={row.stock > 0 ? "filled" : "outlined"}
                                size="small"
                            />
                        </TableCell>
                        {categoryTab === 'chemicals' && <TableCell>{row.expire_date ? new Date(row.expire_date).toLocaleDateString() : '-'}</TableCell>}
                        <TableCell>
                            {userRole === 'owner' && (
                                <ActionButton onClick={() => openEditDialog(row)} title="Edit">
                                    <EditIcon />
                                </ActionButton>
                            )}
                            {userRole === 'owner' && (
                                <ActionButton onClick={() => handleDeleteClick(row)} title="Delete" sx={{ color: '#d32f2f' }}>
                                    <DeleteIcon />
                                </ActionButton>
                            )}
                        </TableCell>
                    </RowComponent>
                );
            });
    };

    const renderAddForm = () => (
        <StyledPaper sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}>
                Add New {categoryTab.charAt(0).toUpperCase() + categoryTab.slice(1)}
            </Typography>
            <form onSubmit={handleAddSubmit}>
                <Stack spacing={3}>
                    {categoryTab === 'paddy' &&
                        <TextField required label="Paddy Name" fullWidth value={formData.paddy_name} onChange={(e) => setFormData({ ...formData, paddy_name: e.target.value })} />
                    }
                    {categoryTab === 'equipment' &&
                        <TextField required label="Equipment Name" fullWidth value={formData.equipment_name} onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })} />
                    }
                    {categoryTab === 'chemicals' &&
                        <TextField required label="Start Name (Fertilizer/Pesticide)" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    }

                    <TextField 
                        required type="number" 
                        label="Price" 
                        fullWidth 
                        value={formData.price} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val < 0) return;
                            setFormData({ ...formData, price: val });
                        }} 
                        inputProps={{ min: 1, step: "0.01" }} 
                    />

                    <TextField 
                        required type="number" 
                        label={categoryTab === 'paddy' ? "Initial Stock (kg)" : "Initial Stock"} 
                        fullWidth 
                        value={formData.stock} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val < 0) return; 
                            setFormData({ ...formData, stock: val });
                        }} 
                        inputProps={{ min: 1, step: "0.01" }}
                    />

                    {categoryTab === 'chemicals' &&
                        <TextField required type="date" label="Expire Date" InputLabelProps={{ shrink: true }} fullWidth value={formData.expire_date} onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })} />
                    }

                    <Button type="submit" variant="contained" size="large" sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                        Add Item
                    </Button>
                </Stack>
            </form>
        </StyledPaper>
    );

    return (
        <Box sx={{ minHeight: '100vh', padding: 3, backgroundColor: 'background.default' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'primary.main', mr: 2 }}>
                    <ArrowBackIcon fontSize="large" />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Inventory Management</Typography>
            </Box>

            {/* Parent Tabs */}
            <Paper elevation={0} sx={{ borderRadius: '25px', mb: 3, bgcolor: 'transparent' }}>
                <Tabs
                    value={parentTab}
                    onChange={(e, v) => setParentTab(v)}
                    centered
                    TabIndicatorProps={{ style: { backgroundColor: 'primary.main', height: 4 } }}
                >
                    <CustomTab label="Inventory Stock" icon={<SearchIcon />} iconPosition="start" />
                    {userRole === 'owner' && (
                        <CustomTab label="Add Inventory" icon={<AddCircleIcon />} iconPosition="start" />
                    )}
                </Tabs>
            </Paper>

            {/* Category Sub-Tabs */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Tabs
                    value={categoryTab}
                    onChange={(e, v) => setCategoryTab(v)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    sx={{ '& .MuiTab-root': { color: 'text.secondary' }, '& .Mui-selected': { color: 'text.primary' } }}
                >
                    <Tab label="Paddy" value="paddy" />
                    <Tab label="Equipment" value="equipment" />
                    <Tab label="Fertilizer & Pesticides" value="chemicals" />
                </Tabs>
            </Box>

            {/* Content Area */}
            {parentTab === 0 ? (
                // View Stock
                <StyledPaper>
                    {/* Search Bar */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <TextField
                            label="Search..."
                            variant="outlined"
                            size="small"
                            InputProps={{ endAdornment: <SearchIcon color="action" /> }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Box>

                    {loading ? <CircularProgress sx={{ display: 'block', margin: 'auto' }} /> : (
                        <TableContainer>
                            <Table>
                                {renderTableHead()}
                                <TableBody>
                                    {renderTableBody()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <TablePagination
                        component="div"
                        count={filteredData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </StyledPaper>
            ) : (
                // Add Inventory
                renderAddForm()
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {categoryTab === 'paddy' &&
                            <TextField
                                label="Paddy Name"
                                value={formData.paddy_name}
                                onChange={(e) => setFormData({ ...formData, paddy_name: e.target.value })}
                                fullWidth
                                disabled={userRole === 'employee'}
                                helperText={userRole === 'employee' ? 'Only owners can edit names' : ''}
                            />
                        }
                        {categoryTab === 'equipment' &&
                            <TextField
                                label="Equipment Name"
                                value={formData.equipment_name}
                                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                                fullWidth
                                disabled={userRole === 'employee'}
                                helperText={userRole === 'employee' ? 'Only owners can edit names' : ''}
                            />
                        }
                        {categoryTab === 'chemicals' &&
                            <TextField
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                disabled={userRole === 'employee'}
                                helperText={userRole === 'employee' ? 'Only owners can edit names' : ''}
                            />
                        }
                        <TextField 
                            label="Price" 
                            type="number" 
                            value={formData.price} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val < 0) return;
                                setFormData({ ...formData, price: val });
                            }}
                            fullWidth 
                        />
                        <TextField 
                            label={categoryTab === 'paddy' ? "Stock (kg)" : "Stock"} 
                            type="number" value={formData.stock} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val < 0) return;
                                setFormData({ ...formData, stock: val });
                            }}
                            fullWidth 
                        />
                        {categoryTab === 'chemicals' &&
                            <TextField label="Expire Date" type="date" InputLabelProps={{ shrink: true }} value={formData.expire_date} onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })} fullWidth />
                        }
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="success">Save</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Item"
                content="Are you sure you want to delete this item? This action cannot be undone."
            />
        </Box>
    );
};

export default Inventory;
