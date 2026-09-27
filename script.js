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

const submitButton = donationForm
    ? donationForm.querySelector('button[type="submit"]')
    : null;

const statusBox =
    document.getElementById("form-status");


// ==========================================
// SHOW STATUS MESSAGE
// ==========================================

function showStatus(message, isSuccess) {

    if (!statusBox) {
        alert(message);
        return;
    }

    statusBox.style.display = "block";
    statusBox.textContent = message;
    statusBox.style.backgroundColor =
        isSuccess ? "#d4edda" : "#f8d7da";
    statusBox.style.color =
        isSuccess ? "#155724" : "#721c24";
    statusBox.style.border =
        isSuccess
            ? "1px solid #c3e6cb"
            : "1px solid #f5c6cb";
}


// ==========================================
// FORM SUBMISSION
// ==========================================

if (donationForm && submitButton) {
const donationCauseSelect =
    donationForm.elements.donationCause;

const otherCauseContainer =
    document.getElementById("other-cause-container");

const otherCauseInput =
    document.getElementById("other-cause");

if (donationCauseSelect && otherCauseContainer && otherCauseInput) {
    donationCauseSelect.addEventListener("change", function () {
        const isOtherCause = donationCauseSelect.value === "other";
        otherCauseContainer.style.display =
            isOtherCause ? "block" : "none";
        otherCauseInput.required = isOtherCause;

        if (!isOtherCause) {
            otherCauseInput.value = "";
        }
    });
}

donationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const name =
            donationForm.elements.name.value.trim();

        const email =
            donationForm.elements.email.value.trim();

        const month =
            donationForm.elements.month.value;

        const donationCause =
            donationForm.elements.donationCause.value;

        const otherCauseInput =
            document.getElementById("other-cause");

        const otherCause =
            otherCauseInput
                ? otherCauseInput.value.trim()
                : "";

        const amount =
            donationForm.elements.amount.value.trim();

        const screenshotInput =
            donationForm.elements["payment-screenshot"];

        const screenshot =
            screenshotInput.files[0];


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !name ||
            !month ||
            !donationCause ||
            (donationCause === "other" && !otherCause) ||
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

        if (email && !emailRegex.test(email)) {

            showStatus(
                "Please enter a valid email address.",
                false
            );

            return;
        }


        // ==========================================
        // AMOUNT VALIDATION
        // ==========================================

        const numericAmount = Number(amount);

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

        if (!allowedTypes.includes(screenshot.type)) {

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

        const maxFileSize = 5 * 1024 * 1024;

        if (screenshot.size > maxFileSize) {

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

        submitButton.textContent = "Submitting...";

        if (statusBox) {
            statusBox.style.display = "none";
        }


        try {

            // ==========================================
            // CONVERT IMAGE TO BASE64
            // ==========================================

            const screenshotBase64 =
                await convertFileToBase64(screenshot);


            // ==========================================
            // CREATE FORM DATA
            // ==========================================

            const formData = new URLSearchParams();


            // ==========================================
            // USER DETAILS
            // ==========================================

            formData.append("name", name);
            formData.append("email", email);

            // Month dropdown
            formData.append("month", month);

            // Donation cause dropdown
            formData.append("donationCause", donationCause);

            // Custom cause when "Other" is selected
            formData.append(
                "otherCause",
                donationCause === "other"
                    ? otherCause
                    : ""
            );

            // Donation amount
            formData.append(
                "amount",
                numericAmount.toString()
            );


            // ==========================================
            // PAYMENT SCREENSHOT
            // This name MUST match Code.gs
            // ==========================================

            formData.append(
                "paymentScreenshot",
                screenshotBase64
            );


            // ==========================================
            // SEND TO GOOGLE APPS SCRIPT
            // ==========================================

            const response = await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body: formData.toString()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Server returned HTTP ${response.status}`
                );
            }

            const result = await response.json();


            // ==========================================
            // HANDLE SERVER RESPONSE
            // ==========================================

            if (result.success) {

                showStatus(
                    "Thank you! Your donation details have been submitted successfully.",
                    true
                );

                donationForm.reset();

                // Hide Other Cause field after reset
                const otherCauseContainer =
                    document.getElementById("other-cause-container");

                if (otherCauseContainer) {
                    otherCauseContainer.style.display = "none";
                }

                if (otherCauseInput) {
                    otherCauseInput.required = false;
                }

            } else {

                console.error(
                    "Server reported failure:",
                    result.message
                );

                showStatus(
                    "Submission failed: " +
                    (result.message ||
                        "Unknown error. Please try again or contact us."),
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

            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;
        }
    }
);
}


// ==========================================
// FILE → BASE64
// ==========================================

function convertFileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result);
            };

            reader.onerror = function () {
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