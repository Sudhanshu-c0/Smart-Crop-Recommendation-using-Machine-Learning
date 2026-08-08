const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const message = document.getElementById('loginMessage');

        if (!email || !password) {
            message.textContent = 'Email and password are required.';
            message.className = 'message error';
            return;
        }

        try {
            message.textContent = 'Authenticating farmer node...';
            message.className = 'message';

            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || 'Login failed.';
                message.className = 'message error';
                return;
            }

            localStorage.setItem('agriMitraUser', JSON.stringify(data.user));
            message.textContent = 'Access granted. Routing to dashboard...';
            message.className = 'message success';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } catch (error) {
            message.textContent = 'Unable to connect to the AGRI MITRA backend.';
            message.className = 'message error';
        }
    });
}
