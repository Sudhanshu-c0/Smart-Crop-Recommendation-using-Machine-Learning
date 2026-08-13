```javascript
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

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


        try {

            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
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


            // ================= LOGIN FAILED =================

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Invalid email or password.";

                message.className =
                    "message error";

                return;
            }


            // ================= SUCCESS =================

            if (data.user) {

                localStorage.setItem(
                    "agriMitraUser",
                    JSON.stringify(data.user)
                );

            }


            // Save token if backend provides one

            if (data.token) {

                localStorage.setItem(
                    "agriMitraToken",
                    data.token
                );

            }


            message.textContent =
                "✓ Login successful! Opening dashboard...";

            message.className =
                "message success";


            // ================= REDIRECT =================

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 800);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            message.textContent =
                "⚠️ Backend unavailable. Please start the AGRI MITRA server.";

            message.className =
                "message error";

        }

    });

}
```
