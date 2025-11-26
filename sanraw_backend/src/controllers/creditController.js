const creditService = require('../services/creditService');

const createAccount = async (req, res) => {
    try {
        const { nic } = req.body;
        if (!nic) return res.status(400).json({ message: 'NIC is required' });
        await creditService.createCreditAccount(nic);
        res.status(201).json({ message: 'Credit account created' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getCreditInfo = async (req, res) => {
    try {
        const { nic } = req.params;
        const account = await creditService.getCreditByNIC(nic);
        if (!account) return res.status(404).json({ message: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const payCredit = async (req, res) => {
    try {
        const { customer_nic, amount } = req.body;
        const user_id = req.user.id; // From auth middleware

        if (!customer_nic || !amount) {
            return res.status(400).json({ message: 'NIC and Amount required' });
        }

        await creditService.payCredit({ customer_nic, amount, user_id });
        res.json({ message: 'Payment recorded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createAccount,
    getCreditInfo,
    payCredit
};
