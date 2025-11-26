const billModel = require('./src/models/billModel');
const pool = require('./src/config/db');

async function testAnonymousBill() {
    console.log("--- Testing Anonymous Bill Creation ---");
    try {
        const billData = {
            bill_number: 'ANON-' + Date.now(),
            customer_name: null, // Test NULL name
            customer_address: '',
            customer_phone: '',
            payment_type: 'cash',
            total_price: 100.00,
            discount_amount: 0,
            net_price: 100.00,
            user_id: 1
        };
        const items = []; // Empty items for simple test or add one if needed

        const billId = await billModel.createBill(billData, items);
        console.log(`Anonymous bill created successfully with ID: ${billId}`);

        // Cleanup
        await billModel.deleteBill(billId);
        console.log("Test bill cleaned up.");
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await pool.end();
        console.log("--- Test Finished ---");
    }
}

testAnonymousBill();
