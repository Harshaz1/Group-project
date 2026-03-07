import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Container, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import SalesReports from './SalesReports';
import CreditReports from './CreditReports';
import CreditPaymentReports from './CreditPaymentReports';
import PurchaseReports from './PurchaseReports';
import InventoryReports from './InventoryReports';

const Reports = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Reports & Analytics
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Sales Report" sx={{ fontWeight: 'bold' }} />
                    <Tab label="Outstanding Credit" sx={{ fontWeight: 'bold' }} />
                    {/* <Tab label="Credit Collections" sx={{ fontWeight: 'bold' }} />
                    <Tab label="Purchase Report" sx={{ fontWeight: 'bold' }} /> */}
                    <Tab label="Inventory Report" sx={{ fontWeight: 'bold' }} />
                </Tabs>
            </Paper>

            <Box sx={{ mt: 2 }}>
                {tabIndex === 0 && <SalesReports />}
                {tabIndex === 1 && <CreditReports />}
                {/* {tabIndex === 2 && <CreditPaymentReports />}
                {tabIndex === 3 && <PurchaseReports />} */}
                {tabIndex === 2 && <InventoryReports />}
            </Box>
        </Container>
    );
};

export default Reports;
