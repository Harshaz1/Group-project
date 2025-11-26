const salesModel = require('../models/salesModel');
const paddyModel = require('../models/paddyModel');
const equipmentModel = require('../models/equipmentModel');
const chemicalModel = require('../models/chemicalModel');
const creditModel = require('../models/creditModel');

const createSale = async (data) => {
    const { item_id, category, quantity, payment_type, customer_nic } = data;

    // 1. Get Item Price & Check Stock
    let item;
    if (category === 'paddy') item = await paddyModel.getPaddyById(item_id);
    else if (category === 'equipment') item = await equipmentModel.getEquipmentById(item_id);
    else if (category === 'fertilizer_pesticide') item = await chemicalModel.getChemicalById(item_id);
    else throw new Error('Invalid category');

    if (!item) throw new Error('Item not found');

    // Check stock (field name varies? In schema I used 'stock' for all new tables. Product had 'stock_quantity')
    // Schema check: paddy(stock), equipment(stock), fertilizer_pesticide(stock).
    if (item.stock < quantity) throw new Error('Insufficient stock');

    // 2. If Credit, check if customer has account
    if (payment_type === 'credit') {
        if (!customer_nic) throw new Error('Customer NIC required for credit sales');
        const creditAccount = await creditModel.getCreditByNIC(customer_nic);
        if (!creditAccount) throw new Error('Customer credit account not found. Create one first.');
    }

    // 3. Create Sale (Use price from item, or allow override? Usually system price)
    // Need to pass unit price. Schema: paddy(price), equipment(price), fertilizer(price). 
    return await salesModel.createSale({ ...data, category }, item.price);
};

const getAllSales = async () => {
    return await salesModel.getAllSales();
};

const getSaleById = async (id) => {
    return await salesModel.getSaleById(id);
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById
};
