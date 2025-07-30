document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    const username = event.target.username.value;
    const password = event.target.password.value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // If login is successful, redirect to the admin page
            errorMessage.textContent = '';
            window.location.href = 'admin.html';
        } else {
            // If login fails, show an error message
            errorMessage.textContent = result.message || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Could not connect to the server.';
    }
});