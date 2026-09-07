const signupForm = document.getElementById("signupForm");

<<<<<<< HEAD
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
=======
if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {
>>>>>>> 2701f995008f88afa9d85da95826b4c382fedcde

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


<<<<<<< HEAD
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
=======
        try {

            // ================= API REQUEST =================

            const response = await fetch(
                "http://localhost:3000/api/auth/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            // ================= RESPONSE =================

            let data;

            try {

                data = await response.json();

            } catch {

                data = {};

            }


            // ================= REGISTRATION FAILED =================

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Registration failed. Please try again.";

                message.className =
                    "message error";

                return;
            }


            // ================= SAVE USER =================

            if (data.user) {

                localStorage.setItem(
                    "agriMitraUser",
                    JSON.stringify(data.user)
                );

            }


            // Save authentication token if provided

            if (data.token) {

                localStorage.setItem(
                    "agriMitraToken",
                    data.token
                );

            }


            // ================= SUCCESS =================

            message.textContent =
                "✓ Account created successfully!";

            message.className =
                "message success";


            // ================= REDIRECT =================

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 900);


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            message.textContent =
                "⚠️ Backend unavailable. Please start the AGRI MITRA server.";
>>>>>>> 2701f995008f88afa9d85da95826b4c382fedcde

            message.className =
                "message error";

<<<<<<< HEAD
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
=======
        }

    });

}
```
>>>>>>> 2701f995008f88afa9d85da95826b4c382fedcde
