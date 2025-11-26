const API_URL = 'http://localhost:5000/auth';
const timestamp = Date.now();
const email = `test_inactive_${timestamp}@example.com`;
const password = 'password123';

async function runVerification() {
    try {
        // 1. Signup
        console.log(`1. Signing up user: ${email}`);
        const signupResponse = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Test',
                last_name: 'User',
                email: email,
                password: password,
                confirmPassword: password
            })
        });
        
        const signupData = await signupResponse.json();
        if (!signupResponse.ok) {
            console.error('   Signup failed:', signupData);
            process.exit(1);
        }
        console.log('   Signup successful.');

        // 2. Login (Expect Failure)
        console.log('2. Attempting login (expecting failure)...');
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
            console.error('   FAILED: Login succeeded but should have failed.');
            process.exit(1);
        } else {
            const message = loginData.message;
            console.log(`   Server responded with status: ${loginResponse.status}`);
            console.log(`   Message: "${message}"`);
            
            const expectedMessage = `please activate your account (see inbox in ${email})`;
            if (message === expectedMessage) {
                console.log('   SUCCESS: Error message matches expected.');
            } else {
                console.error(`   FAILED: Expected "${expectedMessage}", got "${message}"`);
                process.exit(1);
            }
        }

    } catch (error) {
        console.error('Unexpected error:', error.message);
        process.exit(1);
    }
}

runVerification();
