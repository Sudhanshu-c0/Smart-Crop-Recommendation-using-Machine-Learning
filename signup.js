const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert(' signup  successful');
    });
}
