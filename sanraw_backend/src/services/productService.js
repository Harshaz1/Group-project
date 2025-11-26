const productModel = require('../models/productModel');

const createProduct = async (data) => {
    return await productModel.createProduct(data);
};

const getAllProducts = async () => {
    return await productModel.getAllProducts();
};

const getProductById = async (id) => {
    return await productModel.getProductById(id);
};

const updateProduct = async (id, data) => {
    return await productModel.updateProduct(id, data);
};

const deleteProduct = async (id) => {
    return await productModel.deleteProduct(id);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
