import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Box, Typography } from '@mui/material';

const SalesGrowthChart = ({ data }) => {
    // If no data, show a placeholder or empty state
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No sales data for this month</Typography>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#757575' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getDate(); // Just show the day number
                    }}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#757575' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `LKR ${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#2e7d32', fontWeight: 600 }}
                    cursor={{ stroke: '#4caf50', strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#4caf50"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SalesGrowthChart;
