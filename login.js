const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Frontend login demo successful. AGRI MITRA is ready.');
    });
}
