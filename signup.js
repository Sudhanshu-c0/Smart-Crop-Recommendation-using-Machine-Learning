const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

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

            message.className =
                "message error";

        }

    });

}
```
