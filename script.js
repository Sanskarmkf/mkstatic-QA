// ==========================================
// SANSKAR DONATION FORM
// ==========================================

// ==========================================
// GOOGLE APPS SCRIPT URL
// ==========================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwViVs-LgR4w9mNCkPIbbmaoGHmSIrk6dljIX7IDxgDHvPsDO9Z9s_QLeFHhxAdJMRPIw/exec";


// ==========================================
// GET FORM ELEMENTS
// ==========================================

const donationForm =
    document.getElementById("donationForm");

const submitButton =
    donationForm.querySelector(
        'button[type="submit"]'
    );

const statusBox =
    document.getElementById("form-status");


// ==========================================
// SHOW STATUS MESSAGE (replaces alert())
// ==========================================

function showStatus(message, isSuccess) {

    if (!statusBox) {
        // Fallback if the status div isn't on the page yet
        alert(message);
        return;
    }

    statusBox.style.display = "block";
    statusBox.textContent = message;
    statusBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da";
    statusBox.style.color = isSuccess ? "#155724" : "#721c24";
    statusBox.style.border = isSuccess ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
}


// ==========================================
// FORM SUBMISSION
// ==========================================

donationForm.addEventListener(
    "submit",
    async function (event) {

        // Prevent normal HTML form submission
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

        const amount =
            document
                .getElementById("amount")
                .value
                .trim();

        const screenshotInput =
            document.getElementById(
                "payment-screenshot"
            );

        const screenshot =
            screenshotInput.files[0];


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !name ||
            !email ||
            !phone ||
            !amount ||
            !screenshot
        ) {

            showStatus(
                "Please fill all fields and upload the payment screenshot.",
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

            showStatus(
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

            showStatus(
                "Please enter a valid 10-digit Indian phone number.",
                false
            );

            return;
        }


        // ==========================================
        // AMOUNT VALIDATION
        // ==========================================

        const numericAmount =
            Number(amount);

        if (
            isNaN(numericAmount) ||
            numericAmount <= 0
        ) {

            showStatus(
                "Please enter a valid donation amount.",
                false
            );

            return;
        }


        // ==========================================
        // FILE TYPE VALIDATION
        // ==========================================

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (
            !allowedTypes.includes(
                screenshot.type
            )
        ) {

            showStatus(
                "Please upload a JPG, PNG, WEBP, or GIF image.",
                false
            );

            return;
        }


        // ==========================================
        // FILE SIZE VALIDATION
        // Maximum = 5 MB
        // ==========================================

        const maxFileSize =
            5 * 1024 * 1024;

        if (
            screenshot.size >
            maxFileSize
        ) {

            showStatus(
                "Payment screenshot must be smaller than 5 MB.",
                false
            );

            return;
        }


        // ==========================================
        // DISABLE SUBMIT BUTTON
        // ==========================================

        submitButton.disabled = true;

        const originalButtonText =
            submitButton.textContent;

        submitButton.textContent =
            "Submitting...";

        statusBox.style.display = "none";


        try {

            // ==========================================
            // CONVERT IMAGE TO BASE64
            // ==========================================

            const screenshotBase64 =
                await convertFileToBase64(
                    screenshot
                );


            // ==========================================
            // CREATE FORM DATA
            // ==========================================

            const formData =
                new URLSearchParams();


            // User details
            formData.append(
                "name",
                name
            );

            formData.append(
                "email",
                email
            );

            formData.append(
                "phone",
                phone
            );

            formData.append(
                "amount",
                numericAmount.toString()
            );


            // ==========================================
            // IMPORTANT
            // This name MUST match Code.gs
            // ==========================================

            formData.append(
                "paymentScreenshot",
                screenshotBase64
            );


            // ==========================================
            // SEND ORIGINAL FILE INFORMATION
            // ==========================================

            formData.append(
                "fileName",
                screenshot.name
            );

            formData.append(
                "mimeType",
                screenshot.type
            );


            // ==========================================
            // SEND TO GOOGLE APPS SCRIPT
            //
            // NOTE: mode:"no-cors" was removed on purpose.
            // Apps Script web apps deployed with
            // "Execute as: Me" + "Who has access: Anyone"
            // DO support normal cross-origin fetch for
            // simple content types like this one, which
            // means we can now actually read whether the
            // save succeeded or failed instead of getting
            // a fake "Thank you" every single time.
            // ==========================================

            const response = await fetch(
                GOOGLE_SCRIPT_URL,
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

                showStatus(
                    "Thank you! Your donation details have been submitted successfully.",
                    true
                );

                donationForm.reset();

            } else {

                console.error("Server reported failure:", result.message);

                showStatus(
                    "Submission failed: " + (result.message || "Unknown error. Please try again or contact us."),
                    false
                );
            }


        } catch (error) {

            // ==========================================
            // NETWORK / UNEXPECTED ERROR
            // ==========================================

            console.error(
                "Submission error:",
                error
            );

            showStatus(
                "Something went wrong while submitting the form. Please check your internet connection and try again.",
                false
            );

        } finally {

            // ==========================================
            // ENABLE BUTTON AGAIN
            // ==========================================

            submitButton.disabled =
                false;

            submitButton.textContent =
                originalButtonText;
        }
    }
);


// ==========================================
// FILE → BASE64
// ==========================================

function convertFileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );
                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Failed to read screenshot."
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}