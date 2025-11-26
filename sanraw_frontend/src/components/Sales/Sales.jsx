import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Tabs, Tab, Container, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/system';
import SellsTab from './SellsTab';
import BuyTab from './tabs/BuyTab';
import SupplierBillsTab from './tabs/SupplierBillsTab';
import CashTab from './tabs/CashTab';
import CreditTab from './tabs/CreditTab';
import RecentBillTab from './tabs/RecentBillTab';

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

const Sales = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
            {/* Header / Back Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/dashboard')}>
                    <ArrowBackIcon sx={{ fontSize: 30, color: 'text.primary' }} />
                </IconButton>
                {/* No Profile Icon as requested */}
            </Box>

            {/* Top Tabs */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: '10px', mb: 4, py: 1 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    TabIndicatorProps={{ style: { display: 'none' } }}
                    sx={{
                        '& .MuiTab-root': {
                            mx: 2,
                            fontSize: '1.2rem',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: 'text.secondary',
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                        }
                    }}
                >
                    <StyledTab label="Sells" />
                    <StyledTab label="Buy & Suppliers" />
                    <StyledTab label="Inventory Buy & Supplier Bills" />
                    <StyledTab label="Credit" />
                    <StyledTab label="Cash" />
                    <StyledTab label="Recent Bill" />
                </Tabs>
            </Box>

            {/* Content Area */}
            <Container maxWidth="lg">
                {tabValue === 0 && <SellsTab />}
                {tabValue === 1 && <BuyTab />}
                {tabValue === 2 && <SupplierBillsTab />}
                {tabValue === 3 && <CreditTab />}
                {tabValue === 4 && <CashTab />}
                {tabValue === 5 && <RecentBillTab />}
            </Container>
        </Box>
    );
};

export default Sales;
