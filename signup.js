const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = signupForm.name.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const message = document.getElementById('signupMessage');

        if (!name || !email || !password) {
            message.textContent = 'All fields are required.';
            message.className = 'message error';
            return;
        }

        try {
            message.textContent = 'Registering farmer profile...';
            message.className = 'message';

            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || 'Registration failed.';
                message.className = 'message error';
                return;
            }

            localStorage.setItem('agriMitraUser', JSON.stringify(data.user));
            message.textContent = 'Account created. Redirecting...';
            message.className = 'message success';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 900);
        } catch (error) {
            message.textContent = 'Unable to reach the backend registration service.';
            message.className = 'message error';
        }
    });
}
