import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Container, TextField, Avatar, Tabs, Tab, CircularProgress, InputAdornment,Dialog,
    DialogTitle,DialogContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Fallback if no specific icon
import EmployeeDetailsModal from './EmployeeDetailsModal';
import CreateAccount from './CreateAccount';
import { toast } from 'react-toastify';
import { styled, useTheme } from '@mui/system';
import ConfirmationDialog from '../common/ConfirmationDialog';

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

const StatusDot = styled(Box)(({ theme, status }) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: status === 'active' ? '#00e676' : '#ff5252',
    position: 'absolute',
    bottom: 2,
    right: 2,
    border: `2px solid ${theme.palette.background.paper}`
}));

const Employees = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employeeHistory, setEmployeeHistory] = useState([]);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editEmployeeData, setEditEmployeeData] = useState({
        id: '',
        first_name: '',
        last_name: '',
        username: '',      
        password: '',   
        phone_number: '',
        status: ''
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter only logic: hide owner
                const employeeList = data.filter(u => u.role === 'employee');
                setEmployees(employeeList);
            }
        } catch (error) {
            console.error("Error fetching employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleDeleteClick = (id) => {
        setEmployeeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/${employeeToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Account deleted");
                setEmployees(employees.filter(emp => emp.id !== employeeToDelete));
                handleCloseModal();
            } else {
                toast.error("Failed to delete account");
            }
        } catch (error) {
            toast.error("Error deleting account");
        } finally {
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleEdit = (employee) => {
        setEditEmployeeData({
            id: employee.id,
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            username: employee.username || '', // Populate current email
            password: '',                // Keep password empty initially
            phone_number: employee.phone_number || '',
            status: employee.status || 'active'
        });
        setEditDialogOpen(true);
    };

    const handleSaveEmployeeEdit = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/${editEmployeeData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editEmployeeData)
            });
    
            if (response.ok) {
                toast.success("Employee updated successfully");
                setEditDialogOpen(false);
                fetchEmployees(); // Refresh the list
                handleCloseModal(); // Close the details modal if it was open
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to update employee");
            }
        } catch (error) {
            toast.error("Error updating employee details");
        }
    };

    const handleViewHistory = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/${id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEmployeeHistory(data);
                setHistoryModalOpen(true); // Open a modal to show history
            } else {
                toast.error("Could not fetch history");
            }
        } catch (error) {
            toast.error("Error fetching history");
        }
    };

    // Filter and Pagination
    const filteredEmployees = employees.filter(emp =>
        (emp.first_name + ' ' + emp.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limit to 10 per page (just showing first 10 for simple list as requested "only show ten")
    const displayedEmployees = filteredEmployees.slice(0, 10);

    return (
        <Container maxWidth="md" sx={{ mt: 5, position: 'relative', minHeight: '80vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Employee Accounts</Typography>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered TabIndicatorProps={{ style: { backgroundColor: theme.palette.primary.main } }}>
                    <StyledTab label="View All Accounts" />
                    <StyledTab label="Create New Accounts" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <TextField
                            placeholder="Search here"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            sx={{
                                width: '70%',
                                '& .MuiOutlinedInput-root': { borderRadius: '20px', border: `1px solid ${theme.palette.primary.light}` }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}><CloseIcon fontSize="small" /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 'bold' }}>View All</Button>
                    </Box>

                    {loading ? <CircularProgress sx={{ display: 'block', mx: 'auto' }} /> : (
                        <Box>
                            {displayedEmployees.map((emp) => (
                                <Box
                                    key={emp.id}
                                    onClick={() => handleEmployeeClick(emp)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', mb: 2, p: 1,
                                        cursor: 'pointer', borderRadius: '10px',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ position: 'relative', mr: 3 }}>
                                        <Avatar src={emp.profile_image} sx={{ width: 50, height: 50 }} />
                                        <StatusDot status={emp.status} />
                                    </Box>
                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: 'text.primary' }}>
                                        {emp.first_name} {emp.last_name || `Employee ${emp.id}`}
                                    </Typography>
                                </Box>
                            ))}
                            {displayedEmployees.length === 0 && <Typography align="center" color="textSecondary">No employees found.</Typography>}
                        </Box>
                    )}
                </>
            )}

            {tabValue === 1 && (
                <Box sx={{ mt: 5 }}>
                    <CreateAccount onAccountCreated={() => {
                        setTabValue(0);
                        fetchEmployees();
                    }} />
                </Box>
            )}

            <EmployeeDetailsModal
                open={modalOpen}
                onClose={handleCloseModal}
                employee={selectedEmployee}
                onViewHistory={handleViewHistory} 
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Employee Details</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="First Name"
                            fullWidth
                            value={editEmployeeData.first_name}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, first_name: e.target.value })}
                        />
                        <TextField
                            label="Last Name"
                            fullWidth
                            value={editEmployeeData.last_name}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, last_name: e.target.value })}
                        />
                        <TextField
                            label="Username"
                            fullWidth
                            value={editEmployeeData.username}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, username: e.target.value })}
                        />
                        <TextField
                            label="Reset Password"
                            type="password"
                            placeholder="Leave blank to keep current password"
                            fullWidth
                            value={editEmployeeData.password}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, password: e.target.value })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={editEmployeeData.phone_number}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, phone_number: e.target.value })}
                        />
                        <TextField
                            select
                            label="Status"
                            fullWidth
                            SelectProps={{ native: true }}
                            value={editEmployeeData.status}
                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEmployeeEdit} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        Save Changes
                    </Button>
                </Box>
            </Dialog>

            <Dialog 
                open={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                fullWidth 
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Employee Login History</DialogTitle>
                <DialogContent dividers>
                    {employeeHistory.length > 0 ? (
                        employeeHistory.map((log) => (
                            <Box key={log.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: 1 }}>
                                <Typography variant="body2">
                                    {new Date(log.login_time).toLocaleDateString()} at {new Date(log.login_time).toLocaleTimeString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Logout: {log.logout_time ? new Date(log.logout_time).toLocaleTimeString() : 'Still Active'}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography align="center" sx={{ py: 3 }}>No history found for this employee.</Typography>
                    )}
                </DialogContent>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setHistoryModalOpen(false)} variant="contained" color="primary">
                        Close
                    </Button>
                </Box>
            </Dialog>

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Account"
                content="Are you sure you want to delete this account? This action cannot be undone."
            />

        </Container>
    );
};

export default Employees;
