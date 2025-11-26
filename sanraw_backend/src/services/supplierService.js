const supplierModel = require('../models/supplierModel');

const getAllSuppliers = async () => {
    return await supplierModel.getAllSuppliers();
};

const getSupplierById = async (id) => {
    return await supplierModel.getSupplierById(id);
};

const createSupplier = async (supplierData) => {
    return await supplierModel.createSupplier(supplierData);
};

const updateSupplier = async (id, supplierData) => {
    return await supplierModel.updateSupplier(id, supplierData);
};

const deleteSupplier = async (id) => {
    return await supplierModel.deleteSupplier(id);
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
