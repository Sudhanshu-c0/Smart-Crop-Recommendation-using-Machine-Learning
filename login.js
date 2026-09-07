const loginForm = document.getElementById("loginForm");

// ============================================================
// AGRI MITRA - LOGIN (FRONTEND ONLY)
// Checks against users stored in localStorage by signup.js.
// Demo-only auth flow, no real security.
// ============================================================

const USERS_KEY = "agriMitraUsers";

function getStoredUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(USERS_KEY)
        ) || [];

    } catch {

        return [];

    }

}


if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;

        const message =
            document.getElementById("loginMessage");


        // ================= VALIDATION =================

        if (!email || !password) {

            message.textContent =
                "Please enter your email and password.";

            message.className =
                "message error";

            return;
        }


        // ================= LOADING =================

        message.textContent =
            "🔐 Authenticating farmer...";

        message.className =
            "message";


        // ================= CHECK CREDENTIALS =================

        const users =
            getStoredUsers();

        const user =
            users.find(
                item =>
                    item.email.toLowerCase() ===
                        email.toLowerCase() &&
                    item.password === password
            );


        if (!user) {

            message.textContent =
                "Invalid email or password.";

            message.className =
                "message error";

            return;
        }


        // ================= SUCCESS =================

        localStorage.setItem(
            "agriMitraUser",
            JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            })
        );


        message.textContent =
            "✓ Login successful! Opening dashboard...";

        message.className =
            "message success";


        // ================= REDIRECT =================

        setTimeout(() => {

            window.location.href =
                "user-dashboard.html";

        }, 800);

    });

}
