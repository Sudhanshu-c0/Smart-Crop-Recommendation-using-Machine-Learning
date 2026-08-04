const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const cropForm = document.getElementById('cropForm');

if (tabButtons.length > 0) {
    function switchTab(target) {
        tabButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.tab === target);
        });

        authForms.forEach((form) => {
            form.classList.toggle('active-form', form.id === `${target}Form`);
        });
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });
}

if (cropForm) {
    cropForm.addEventListener('submit', (event) => {
        event.preventDefault();
    });
}
