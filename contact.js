// ==========================================
// SANSKAR CONTACT FORM
// ==========================================

// ==========================================
// GOOGLE APPS SCRIPT URL
// (from the contact form's original action attribute)
// ==========================================

const CONTACT_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxYPp2aStWmY7gjMTdPzyHorX4Nj3o1NGA5_HxpRwcL-Du8om5RPrrJ0Y8uejgM6KV30w/exec";


// ==========================================
// GET FORM ELEMENTS
// ==========================================

const contactForm =
    document.getElementById("contactForm");

const contactSubmitButton =
    contactForm.querySelector(
        'button[type="submit"]'
    );

const contactStatusBox =
    document.getElementById("form-status");


// ==========================================
// SHOW STATUS MESSAGE
// ==========================================

function showContactStatus(message, isSuccess) {

    if (!contactStatusBox) {
        alert(message);
        return;
    }

    contactStatusBox.style.display = "block";
    contactStatusBox.textContent = message;
    contactStatusBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da";
    contactStatusBox.style.color = isSuccess ? "#155724" : "#721c24";
    contactStatusBox.style.border = isSuccess ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
}


// ==========================================
// FORM SUBMISSION
// ==========================================

contactForm.addEventListener(
    "submit",
    async function (event) {

        // Prevent the default full-page navigation to the
        // Apps Script response (that's what was happening before)
        event.preventDefault();


        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const phone =
            document
                .getElementById("phone")
                .value
                .trim();

        const address =
            document
                .getElementById("address")
                .value
                .trim();


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !name ||
            !email ||
            !phone ||
            !address
        ) {

            showContactStatus(
                "Please fill all fields.",
                false
            );

            return;
        }


        // ==========================================
        // EMAIL VALIDATION
        // ==========================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            showContactStatus(
                "Please enter a valid email address.",
                false
            );

            return;
        }


        // ==========================================
        // PHONE VALIDATION
        // ==========================================

        const phoneRegex =
            /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone)) {

            showContactStatus(
                "Please enter a valid 10-digit Indian phone number.",
                false
            );

            return;
        }


        // ==========================================
        // DISABLE SUBMIT BUTTON
        // ==========================================

        contactSubmitButton.disabled = true;

        const originalButtonText =
            contactSubmitButton.textContent;

        contactSubmitButton.textContent =
            "Submitting...";

        contactStatusBox.style.display = "none";


        try {

            // ==========================================
            // CREATE FORM DATA
            // ==========================================

            const formData =
                new URLSearchParams();

            formData.append("name", name);
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("address", address);


            // ==========================================
            // SEND TO GOOGLE APPS SCRIPT
            // ==========================================

            const response = await fetch(
                CONTACT_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        formData.toString()
                }
            );

            const result = await response.json();


            // ==========================================
            // HANDLE REAL RESULT
            // ==========================================

            if (result.success) {

                showContactStatus(
                    "Thank you! Your message has been submitted successfully.",
                    true
                );

                contactForm.reset();

            } else {

                console.error("Server reported failure:", result.message);

                showContactStatus(
                    "Submission failed: " + (result.message || "Unknown error. Please try again or contact us."),
                    false
                );
            }


        } catch (error) {

            console.error(
                "Contact form submission error:",
                error
            );

            showContactStatus(
                "Something went wrong while submitting the form. Please check your internet connection and try again.",
                false
            );

        } finally {

            contactSubmitButton.disabled =
                false;

            contactSubmitButton.textContent =
                originalButtonText;
        }
    }
);