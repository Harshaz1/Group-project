import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledTableCell = styled(TableCell)({
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#81c784', // Greenish header
    textAlign: 'center',
    borderRight: '1px solid #fff'
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#fff',
    },
    '&:nth-of-type(even)': {
        backgroundColor: '#e8f5e9', // Light green stripe
    },
}));

const BillTable = ({ items, onDelete }) => {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: 3, p: 2, border: '1px solid #e0e0e0' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>NO.</StyledTableCell>
                        <StyledTableCell>PRODUCT NAME</StyledTableCell>
                        <StyledTableCell>UNIT PRICE</StyledTableCell>
                        <StyledTableCell>QTY</StyledTableCell>
                        <StyledTableCell>DISCOUNT</StyledTableCell>
                        <StyledTableCell>EXT PRICE</StyledTableCell>
                        <StyledTableCell sx={{ borderRight: 'none' }}>ACTION</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <StyledTableRow key={item.id || index}>
                            <TableCell align="center" className="text-secondary">{index + 1}</TableCell>
                            <TableCell align="center">{item.productName}</TableCell>
                            <TableCell align="center">{item.unitPrice}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="center">{item.discount || 0}</TableCell>
                            <TableCell align="center">{item.extPrice}</TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onDelete(item.id)} color="error" size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </StyledTableRow>
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#aaa' }}>
                                No items added yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BillTable;
