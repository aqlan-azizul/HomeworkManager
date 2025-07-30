document.addEventListener('submit', async (event) => {
    event.preventDefault();

    // IMPORTANT: Replace this with your actual Render backend URL
    const API_BASE_URL = 'https://homeworkmanager-1.onrender.com';

    const username = event.target.username.value;
    const password = event.target.password.value;
    const errorMessage = document.getElementById('error-message');

    try {
        // Use the live API URL
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            errorMessage.textContent = '';
            // Redirect to the admin page on the same live domain
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = result.message || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Could not connect to the server.';
    }
});
