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

if (donationForm && statusBox) {
    window.addEventListener("pageshow", function () {
        donationForm.reset();
        statusBox.style.display = "none";
        statusBox.textContent = "";
    });
}

const DEFAULT_FUNDRAISING_GOAL = 45000;
const PRIVATE_DONATION_API_URL = (typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://localhost:3000/api/donation-summary?cause=Food%20Distribution"
    : "/api/donation-summary?cause=Food%20Distribution";
let excelDonationSummary = { totalReceived: 0, donationCount: 0 };

if (typeof localStorage !== "undefined") {
    const storedGoal = Number(localStorage.getItem("sanskarFundraisingGoal"));
    if (!Number.isFinite(storedGoal) || storedGoal <= 0) {
        localStorage.setItem("sanskarFundraisingGoal", String(DEFAULT_FUNDRAISING_GOAL));
    }
}

window.setSanskarFundraisingGoal = function (amount) {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return false;
    }

    localStorage.setItem("sanskarFundraisingGoal", String(parsedAmount));
    updateDonationTracker();
    return true;
};

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

                addDonationToTracker(numericAmount);

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

function addDonationToTracker(amount) {
    const storedAmount = Number(localStorage.getItem("sanskarDonationAmount")) || 0;
    const storedCount = Number(localStorage.getItem("sanskarDonationCount")) || 0;

    localStorage.setItem("sanskarDonationAmount", String(storedAmount + amount));
    localStorage.setItem("sanskarDonationCount", String(storedCount + 1));
    updateDonationTracker();
}

async function loadDonationSheetData() {
    try {
        const response = await fetch(PRIVATE_DONATION_API_URL, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Donation workbook request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data || !Number.isFinite(data.totalReceived) || !Number.isFinite(data.donationCount)) {
            throw new Error("Donation workbook returned an invalid summary");
        }

        excelDonationSummary = {
            totalReceived: data.totalReceived,
            donationCount: data.donationCount,
        };
        const statusElement = document.getElementById("donation-data-status");
        if (statusElement) {
            statusElement.hidden = true;
            statusElement.textContent = "";
        }
    } catch (error) {
        console.warn("Unable to read donation workbook:", error);
        const statusElement = document.getElementById("donation-data-status");
        if (statusElement) {
            statusElement.hidden = false;
            statusElement.textContent = "Donation totals could not be updated. Please try again later.";
        }
        return;
    }

    updateDonationTracker();
}

if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
        loadDonationSheetData();
        setInterval(() => {
            loadDonationSheetData();
        }, 15000);
    });
}

function updateDonationTracker() {
    const goalElement = document.getElementById("fundraising-goal");
    const receivedElement = document.getElementById("total-received");
    const balanceElement = document.getElementById("remaining-balance");
    const donationsElement = document.getElementById("total-donations");
    const progressBar = document.getElementById("goal-progress-bar");
    const progressText = document.getElementById("goal-progress-text");
    const updatedElement = document.getElementById("donation-updated");

    if (!goalElement || !receivedElement) {
        return;
    }

    const fundraisingGoal = Number(localStorage.getItem("sanskarFundraisingGoal")) || DEFAULT_FUNDRAISING_GOAL;
    const totalReceived = excelDonationSummary.totalReceived;
    const remainingBalance = Math.max(fundraisingGoal - totalReceived, 0);

    goalElement.textContent = `₹${fundraisingGoal.toLocaleString("en-IN")}`;
    receivedElement.textContent = `₹${totalReceived.toLocaleString("en-IN")}`;
    if (balanceElement) {
        balanceElement.textContent = `₹${remainingBalance.toLocaleString("en-IN")}`;
    }

    if (donationsElement) {
        donationsElement.textContent = String(excelDonationSummary.donationCount);
    }

    if (progressBar) {
        const progressPercent = Math.min((totalReceived / fundraisingGoal) * 100, 100);
        progressBar.style.width = `${progressPercent}%`;
        progressBar.parentElement.setAttribute("aria-label", `${Math.round(progressPercent)} percent of fundraising goal reached`);
        progressBar.parentElement.setAttribute("aria-valuenow", String(Math.round(progressPercent)));
        if (progressText) {
            progressText.textContent = `${Math.round(progressPercent)}% reached`;
        }
    }

    if (updatedElement) {
        const updatedAt = new Date();
        updatedElement.dateTime = updatedAt.toISOString().slice(0, 10);
        updatedElement.textContent = new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(updatedAt);
    }
}

// ==========================================
// DONATION TABS
// ==========================================

const donationTabs = document.querySelectorAll(".donation-tab");
const donationPanels = document.querySelectorAll(".donation-panel, .tracker-panel");

if (donationTabs.length && donationPanels.length) {
    updateDonationTracker();

    const donateTab = document.getElementById("donate-tab");
    const donatePanel = document.getElementById("donate-panel");

    if (donateTab && donatePanel) {
        donateTab.classList.add("active");
        donateTab.setAttribute("aria-selected", "true");
        donatePanel.hidden = false;
        donationPanels.forEach((panel) => {
            if (panel !== donatePanel) {
                panel.hidden = true;
            }
        });
    }

donationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const selectedPanel = document.getElementById(tab.getAttribute("aria-controls"));

        donationTabs.forEach((item) => {
            const isSelected = item === tab;
            item.classList.toggle("active", isSelected);
            item.setAttribute("aria-selected", String(isSelected));
        });

        donationPanels.forEach((panel) => {
            panel.hidden = panel !== selectedPanel;
        });
    });
});
}
