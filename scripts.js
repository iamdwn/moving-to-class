
function autoSave() {
    let countdownTime = 5; // Set countdown

    const countdownInterval = setInterval(function() {
        console.log(`Tự động đổi lớp trong ${countdownTime} giây...`);
        countdownTime--;

        if (countdownTime < 0) {
            clearInterval(countdownInterval);

            // Click Save
            document.getElementById("ctl00_mainContent_btSave").click();

            // Kiểm tra
            const successElement = document.getElementById("successMessageId");
            const successMessage = "Đổi lớp thành công !!";

            const intervalId = setInterval(function() {
                if (successElement && successElement.innerText.includes(successMessage)) {
                    alert(successMessage);
                    clearInterval(intervalId); // Dừng
                }
            }, 1000); 
        }
    }, 1000);
}
autoSave();

window.alert = function(message) {
    console.log("Alert triggered: " + message);
    setTimeout(function() {
        console.log("Alert auto-closed (simulating OK press)");
    }, 1000);
};
