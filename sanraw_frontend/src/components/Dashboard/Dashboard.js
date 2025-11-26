import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Grid,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    IconButton,
    useTheme,
    useMediaQuery,
    Container,
    Card,
    CardActionArea,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    Badge,
    Menu,
    MenuItem,
    Switch,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    ReceiptLong as ReceiptIcon,
    Assessment as AssessmentIcon,
    Close as CloseIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';


// Context
import { ThemeContext } from '../../context/ThemeContext';

// Charts
import SalesGrowthChart from './charts/SalesGrowthChart';
import PaddyStockChart from './charts/PaddyStockChart';
import InventorySummaryChart from './charts/InventorySummaryChart';

const drawerWidth = 92;

// ---------- Styled ----------
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0,
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    [theme.breakpoints.up('lg')]: {
        marginLeft: `${drawerWidth}px`,
    },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        borderRight: 'none',
        background: 'transparent',
        padding: theme.spacing(2, 1),
    },
}));

const SidebarShell = styled(Paper)(({ theme }) => ({
    height: 'calc(100vh - 32px)',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 26,
    border: `2px solid ${theme.palette.mode === 'dark' ? '#333' : '#CFF3DD'}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
}));

const SidebarList = styled(List)(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
}));

const IconCircle = styled(Box)(({ theme }) => ({
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${theme.palette.mode === 'dark' ? '#333' : '#CFF3DD'}`,
    boxShadow: theme.shadows[2],
    background: theme.palette.background.paper,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.1)',
        backgroundColor: theme.palette.action.hover
    }
}));

const ChartsShell = styled(Paper)(({ theme }) => ({
    borderRadius: 26,
    border: `3px solid ${theme.palette.mode === 'dark' ? '#333' : '#A7EFC3'}`,
    background: theme.palette.background.paper,
    padding: 28,
    boxShadow: theme.shadows[3],
}));

const NavCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f9fbe7 100%)',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#CFF3DD'}`,
    boxShadow: theme.shadows[1],
    transition: 'all 0.3s ease',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[4],
        borderColor: theme.palette.primary.main,
    }
}));

const NavIconBox = styled(Box)(({ theme }) => ({
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    color: theme.palette.primary.main
}));

// ---------- Component ----------
const Dashboard = () => {
    const navigate = useNavigate();
    const themeContext = useContext(ThemeContext);
    const theme = useTheme();
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Chart & Notification data
    const [salesTrend, setSalesTrend] = useState([]);
    const [paddyStock, setPaddyStock] = useState([]);
    const [inventorySummary, setInventorySummary] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    // UI States
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [anchorElNotif, setAnchorElNotif] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                // Fetch Profile
                const profileRes = await fetch(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUser(profileData);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                    return;
                }

                // Fetch Chart Data
                const [trendRes, paddyRes, summaryRes, invRes] = await Promise.all([
                    fetch(`${API_URL}/reports/daily-trend`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/reports/paddy-stock`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/reports/inventory-summary`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/reports/inventory-report`, { headers: { Authorization: `Bearer ${token}` } }) // For search
                ]);

                if (trendRes.ok) setSalesTrend(await trendRes.json());
                if (paddyRes.ok) setPaddyStock(await paddyRes.json());
                if (summaryRes.ok) setInventorySummary(await summaryRes.json());

                // Process notifications & search data
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setLowStockItems(invData.filter(i => i.stock < 10));
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, API_URL]);

    const handleDrawerToggle = () => setMobileOpen((v) => !v);

    // Handlers
    const handleSearchOpen = () => setSearchOpen(true);
    const handleSearchClose = () => setSearchOpen(false);
    const handleSettingsOpen = () => setSettingsOpen(true);
    const handleSettingsClose = () => setSettingsOpen(false);
    const handleNotifClick = (event) => setAnchorElNotif(event.currentTarget);
    const handleNotifClose = () => setAnchorElNotif(null);

    const drawerContent = (
        <SidebarShell elevation={0}>
            <SidebarList>
                {/* <ListItemButton sx={{ p: 0, justifyContent: 'center' }} onClick={handleSearchOpen}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Tooltip title="Search">
                            <IconCircle>
                                <SearchIcon sx={{ fontSize: 30, color: '#3FAE64' }} />
                            </IconCircle>
                        </Tooltip>
                    </ListItemIcon>
                </ListItemButton> */}

                <ListItemButton sx={{ p: 0, justifyContent: 'center' }} onClick={handleNotifClick}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Badge badgeContent={lowStockItems.length} color="error">
                            <Tooltip title="Notifications">
                                <IconCircle>
                                    <NotificationsIcon sx={{ fontSize: 30, color: '#3FAE64' }} />
                                </IconCircle>
                            </Tooltip>
                        </Badge>
                    </ListItemIcon>
                </ListItemButton>

                <ListItemButton sx={{ p: 0, justifyContent: 'center' }} onClick={() => navigate('/reports')}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Tooltip title="Reports">
                            <IconCircle>
                                <AssessmentIcon sx={{ fontSize: 30, color: '#3FAE64' }} />
                            </IconCircle>
                        </Tooltip>
                    </ListItemIcon>
                </ListItemButton>

                <ListItemButton sx={{ p: 0, justifyContent: 'center' }} onClick={handleSettingsOpen}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Tooltip title="Settings">
                            <IconCircle>
                                <SettingsIcon sx={{ fontSize: 30, color: '#3FAE64' }} />
                            </IconCircle>
                        </Tooltip>
                    </ListItemIcon>
                </ListItemButton>
            </SidebarList>
        </SidebarShell>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    if (!user) return null;

    const navItems = [
        { label: 'Inventory', icon: <InventoryIcon sx={{ fontSize: 32 }} />, path: '/inventory', role: 'all' },
        { label: 'Employees', icon: <PeopleIcon sx={{ fontSize: 32 }} />, path: '/employees', role: 'owner' },
        { label: 'Payments', icon: <ReceiptIcon sx={{ fontSize: 32 }} />, path: '/sales', role: 'all' },
        { label: 'Reports', icon: <AssessmentIcon sx={{ fontSize: 32 }} />, path: '/reports', role: 'all' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Mobile Hamburger */}
            {!isLg && (
                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1400,
                        color: 'primary.main',
                        bgcolor: 'background.paper',
                        border: '2px solid #CFF3DD',
                        boxShadow: 3,
                        borderRadius: 3,
                    }}
                >
                    <MenuIcon sx={{ fontSize: 34 }} />
                </IconButton>
            )}

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: 'transparent' },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <StyledDrawer variant="permanent" sx={{ display: { xs: 'none', lg: 'block' } }} open>
                    {drawerContent}
                </StyledDrawer>
            </Box>

            {/* Main */}
            <Main>
                <Container maxWidth="lg" sx={{ position: 'relative' }}>

                    {/* Header Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, pt: 2 }}>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: { xs: '2.0rem', md: '2.5rem' },
                                    fontWeight: 800,
                                    color: theme.palette.mode === 'dark' ? 'primary.light' : '#2e7d32',
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                Welcome back, {user.first_name}!
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 1,
                                    fontSize: { xs: '1.0rem', md: '1.2rem' },
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                Here's what's happening in your business today.
                            </Typography>
                        </Box>

                        <Box sx={{
                            borderRadius: '50%',
                            p: 0.5,
                            border: `3px solid ${theme.palette.primary.main}`,
                            boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate('/profile')}
                        >
                            <Avatar src={user.profile_image} sx={{ width: 64, height: 64 }} />
                        </Box>
                    </Box>

                    {/* Charts Grid */}
                    {/* Charts Grid */}
                    <ChartsShell sx={{ mb: 6 }}>
                        <Box
                            sx={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: 'stretch',
                            }}
                        >
                            {/* Sales Growth */}
                            <Box
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    px: 2,
                                    mb: { xs: 4, md: 0 },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: 'text.primary' }}
                                >
                                    Sales Growth (This Month)
                                </Typography>
                                <Box sx={{ height: 350 }}>
                                    <SalesGrowthChart data={salesTrend} />
                                </Box>
                            </Box>

                            {/* Paddy Stock */}
                            <Box
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    px: 2,
                                    mb: { xs: 4, md: 0 },
                                    borderLeft: { md: `1px solid ${theme.palette.divider}` },
                                    borderRight: { md: `1px solid ${theme.palette.divider}` },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: 'text.primary' }}
                                >
                                    Paddy Stock Levels
                                </Typography>
                                <Box sx={{ height: 350 }}>
                                    <PaddyStockChart data={paddyStock} />
                                </Box>
                            </Box>

                            {/* Inventory Summary */}
                            <Box
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    px: 2,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: 'text.primary' }}
                                >
                                    Inventory Value Summary
                                </Typography>
                                <Box sx={{ height: 350 }}>
                                    <InventorySummaryChart data={inventorySummary} />
                                </Box>
                            </Box>
                        </Box>
                    </ChartsShell>


                    {/* Quick Access Navigation */}
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: 'text.primary' }}>
                        Quick Access
                    </Typography>

                    <Grid container spacing={3}>
                        {navItems.map((item) => (
                            (item.role === 'all' || item.role === user.role) && (
                                <Grid item xs={12} sm={6} md={3} key={item.label}>
                                    <NavCard elevation={0}>
                                        <CardActionArea onClick={() => navigate(item.path)} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <NavIconBox>
                                                {item.icon}
                                            </NavIconBox>
                                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                {item.label}
                                            </Typography>
                                        </CardActionArea>
                                    </NavCard>
                                </Grid>
                            )
                        ))}
                    </Grid>

                </Container>
            </Main>

            {/* --- Dialogs --- */}

            {/* Search Dialog */}
            <Dialog open={searchOpen} onClose={handleSearchClose} fullWidth maxWidth="sm">
                <DialogTitle>Quick Search</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Search Products (Coming Soon: Customers)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ mt: 2 }}>
                        {searchValue && (
                            <Typography variant="body2" color="text.secondary">
                                Results will appear here... (Mockup)
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onClose={handleSettingsClose} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Settings
                    <IconButton onClick={handleSettingsClose}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {/* Dark Mode */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {theme.palette.mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                            <Box>
                                <Typography variant="subtitle1">Dark Mode</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Adjust the appearance
                                </Typography>
                            </Box>
                        </Box>
                        <Switch
                            checked={theme.palette.mode === 'dark'}
                            onChange={themeContext.toggleColorMode}
                        />
                    </Box>
                    <Divider />

                    {/* Notifications removed as requested */}

                    {/* Profile Link */}
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, cursor: 'pointer' }}
                        onClick={() => { navigate('/profile'); handleSettingsClose(); }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleIcon />
                            <Box>
                                <Typography variant="subtitle1">Edit Profile</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Manage personal details
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="primary">Open</Typography>
                    </Box>
                    <Divider />

                    {/* Data Backup */}
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, cursor: 'pointer' }}
                        onClick={() => { alert('Backup started...'); handleSettingsClose(); }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InventoryIcon /> {/* Recycling icon for backup */}
                            <Box>
                                <Typography variant="subtitle1">Backup Data</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Download local backup
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="success.main">Download</Typography>
                    </Box>
                    <Divider />

                    {/* Help & Support */}
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssessmentIcon /> {/* Using info-like icon */}
                            <Box>
                                <Typography variant="subtitle1">Help & Support</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Contact System Admin
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">077-1234567</Typography>
                    </Box>


                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        App Version 1.2.0 (Pro)
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Notification Menu */}
            <Menu
                anchorEl={anchorElNotif}
                open={Boolean(anchorElNotif)}
                onClose={handleNotifClose}
                PaperProps={{
                    style: { maxHeight: 300, width: '300px' }
                }}
            >
                <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                    Notifications
                </Typography>
                <Divider />
                {lowStockItems.length === 0 ? (
                    <MenuItem onClick={handleNotifClose}>No new notifications</MenuItem>
                ) : (
                    lowStockItems.map((item, idx) => (
                        <MenuItem key={idx} onClick={() => { navigate('/inventory'); handleNotifClose(); }}>
                            <Box>
                                <Typography variant="body2" color="error" fontWeight="bold">
                                    Low Stock Alert: {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Only {item.stock} items remaining.
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>

        </Box>
    );
};
export default Dashboard;