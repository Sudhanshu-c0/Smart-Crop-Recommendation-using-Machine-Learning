```javascript
const tabButtons = document.querySelectorAll(".tab-btn");
const authForms = document.querySelectorAll(".auth-form");


// ================= AUTH TABS =================

if (tabButtons.length > 0) {

    function switchTab(target) {

        tabButtons.forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.tab === target
            );

        });

        authForms.forEach((form) => {

            form.classList.toggle(
                "active-form",
                form.id === `${target}Form`
            );

        });

    }


    tabButtons.forEach((button) => {

        button.addEventListener("click", () => {

            switchTab(button.dataset.tab);

        });

    });

}
```

