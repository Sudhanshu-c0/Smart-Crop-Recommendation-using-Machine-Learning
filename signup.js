const signupForm = document.getElementById("signupForm");

// ============================================================
// AGRI MITRA - SIGNUP (FRONTEND ONLY)
// Users are stored in the browser's localStorage. This is a
// demo-only auth flow with no real security — do not use this
// pattern for anything handling real user data.
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

function saveStoredUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


if (signupForm) {

    signupForm.addEventListener("submit", (event) => {

        event.preventDefault();


        // ================= GET FORM DATA =================

        const name =
            signupForm.name.value.trim();

        const email =
            signupForm.email.value.trim();

        const password =
            signupForm.password.value;

        const message =
            document.getElementById("signupMessage");


        // ================= VALIDATION =================

        if (!name || !email || !password) {

            message.textContent =
                "Please fill in all fields.";

            message.className =
                "message error";

            return;
        }


        if (password.length < 6) {

            message.textContent =
                "Password must contain at least 6 characters.";

            message.className =
                "message error";

            return;
        }


        // ================= LOADING =================

        message.textContent =
            "🌱 Creating your AGRI MITRA account...";

        message.className =
            "message";


        // ================= CHECK EXISTING USER =================

        const users =
            getStoredUsers();

        const existing =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (existing) {

            message.textContent =
                "An account already exists for this email.";

            message.className =
                "message error";

            return;
        }


        // ================= SAVE USER =================

        const newUser = {

            id:
                (crypto.randomUUID
                    ? crypto.randomUUID()
                    : `user_${Date.now()}`),

            name,

            email:
                email.toLowerCase(),

            // Demo only: plain text, browser-local storage.
            password,

            createdAt:
                new Date().toISOString()

        };


        users.push(newUser);

        saveStoredUsers(users);


        localStorage.setItem(
            "agriMitraUser",
            JSON.stringify({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            })
        );


        // ================= SUCCESS =================

        message.textContent =
            "✓ Account created successfully!";

        message.className =
            "message success";


        // ================= REDIRECT =================

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 900);

    });

}
