function autoSave() {
    // Click the Save button
    document.getElementById("ctl00_mainContent_btSave").click();

    // Override the alert function to prevent pop-ups from blocking the script
    window.alert = function(message) {
        console.log(message);
        return true; // Automatically dismiss the alert
    };

    // Success message and element to check
    const successMessage = "Your save was successful";
    const successElement = document.getElementById("ctl00_mainContent_lblMessage");

    // Check every second if the success message is displayed
    const intervalId = setInterval(function() {
        if (successElement && successElement.innerText.includes(successMessage)) {
            console.log("Save successful. Stopping automatic process.");
            clearInterval(intervalId); // Stop the interval
        }
    }, 1000); // Check every 1 second
}

// Run the function
autoSave();
