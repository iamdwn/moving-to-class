let saveCount = 0;
let alertDismissCount = 0;
let countdownTime; 

function customAlert(message) {
    setTimeout(function() {
        alertDismissCount++;
        console.log("Alert dismissed: " + alertDismissCount + " times");
    }, 1000);
}

function Save() {
        countdownTime = 5;
        const countdownInterval = setInterval(function() {
        console.log(`Tự động đổi lớp trong ${countdownTime} giây...`);
        countdownTime--;
        if (countdownTime < 0) {
            clearInterval(countdownInterval);
            autoSave()
        }
    }, 1000);
}

function autoSave() {
            document.getElementById("ctl00_mainContent_btSave").addEventListener("click", function(event) {
                event.preventDefault(); // Ngăn tải lại trang hoặc điều hướng
            });

            document.getElementById("ctl00_mainContent_btSave").click();
            saveCount++; // Increment save counter
            console.log("Count: " + saveCount + " times");

            // Kiểm tra tiến trình
            const successElement = document.getElementById("successMessageId");
            const successMessage = "Đổi lớp thành công !!"; 

            const intervalId = setInterval(function() {
                if (successElement && successElement.innerText.includes(successMessage)) {
                    customAlert(successMessage);
                    clearInterval(intervalId); // Dừng check
                }
            }, 1000); 

            // Gọi lại hàm autoSave sau khi hoàn thành để lặp lại
            setTimeout(autoSave, 5000);
}

Save();
