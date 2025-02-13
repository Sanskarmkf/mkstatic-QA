import * as XLSX from 'xlsx';
function saveFormDetails() {
    // Get form values
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let address = document.getElementById("address").value;
    let paymentScreenshot = document.getElementById("payment-screenshot").files[0];

    // Validation: Check if all fields are filled
    if (!name || !email || !phone || !address || !paymentScreenshot) {
        alert("Please fill all fields and upload the payment screenshot.");
        return;
    }

    // Read the payment screenshot as a Base64 encoded string
    let reader = new FileReader();
    reader.readAsDataURL(paymentScreenshot);

    reader.onload = function () {
        let paymentDataURL = reader.result; // Base64 representation of the image

        // Create an array of data (with a link placeholder for the image)
        let data = [
            ["Name", "Email", "Phone", "Address", "Payment Screenshot (Base64)"], // Header row
            [name, email, phone, address, paymentDataURL] // User input data
        ];

        // Convert array to worksheet
        let ws = XLSX.utils.aoa_to_sheet(data);

        // Create a new workbook and append the worksheet
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Donation Data");

        // Generate an Excel file and trigger download
        XLSX.writeFile(wb, "DonationDetails.xlsx");
    };

    reader.onerror = function (error) {
        console.log("Error reading file:", error);
        alert("Error processing the payment screenshot.");
    };
}
