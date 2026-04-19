async function test() {
    try {
        console.log('Testing registration...');
        const regRes = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'test',
                email: 'test@test.com',
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        console.log('Register Success:', regRes.status, regData);

        console.log('Testing login...');
        const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Success:', loginRes.status, loginData);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
test();
