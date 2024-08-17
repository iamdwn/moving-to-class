
function customAlert(message) {
    console.log("Alert triggered: " + message);
    setTimeout(function() {
        console.log("Alert auto-closed (simulating OK press)");
    }, 1000);
}

function autoSave() {
    let countdownTime = 5; 

    const countdownInterval = setInterval(function() {
        console.log(`Tự động đổi lớp trong ${countdownTime} giây...`);
        countdownTime--;

        if (countdownTime < 0) {
            clearInterval(countdownInterval);

            document.getElementById("ctl00_mainContent_btSave").addEventListener("click", function(event) {
                event.preventDefault(); //Ngăn tải lại trang hoặc điều hướng
                customAlert("Đang chuyển ...");
            });

            document.getElementById("ctl00_mainContent_btSave").click();

            // Kiểm tra tiến trình
            const successElement = document.getElementById("successMessageId");
            const successMessage = "Đổi lớp thành công !!"; 

            const intervalId = setInterval(function() {
                if (successElement && successElement.innerText.includes(successMessage)) {
                    customAlert(successMessage);
                    clearInterval(intervalId); // Dừng check
                }
            }, 1000); 
        }
    }, 1000); 
}

autoSave();
