const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Frontend signup demo successful. Account form submitted in UI only.');
    });
}
