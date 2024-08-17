let saveCount = 0;
let alertDismissCount = 0;

window.alert = function(message) {
};

function customAlert(message) {
    setTimeout(function() {

        if (message.includes("Yêu cầu của bạn đã được chấp nhận")) {
            console.log(message);
            return;
        } else {
            console.log(message);
            submitForm(); 
        }

        alertDismissCount++;
    }, 1000);
}

function submitForm(event) {

    const form = document.getElementById("aspnetForm");
    const formData = new FormData(form);

    // if (event) {
    //     event.preventDefault();
    // }

    fetch(form.action, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(text => {
        saveCount++;
        console.log("Save Count: " + saveCount);

        // if (text.includes("Yêu cầu của bạn đã được chấp nhận")) {
        //     customAlert("Yêu cầu của bạn đã được chấp nhận");
        // } else {
        //     customAlert("Not yet");
        // }
    })
    .catch(error => console.error('Error:', error));
}

function manageSubmission() {
    let countdownTime = 3;
    const countdownInterval = setInterval(function() {
        console.log(`Tự động đổi lớp trong ${countdownTime} giây...`);
        countdownTime--;
        if (countdownTime < 0) {
            clearInterval(countdownInterval);
            pressSaveButton();
        }
    }, 1000);
}

function pressSaveButton() {
    const form = document.getElementById("aspnetForm");
    const formData = new FormData(form);
    const saveButton = document.getElementById("ctl00_mainContent_btSave");
    if (saveButton) {
        saveButton.addEventListener("click", function(event) {
            fetch(form.action, {
                method: 'POST',
                body: formData,
            })
            submitForm(event);
        });
        saveButton.click(); 
    } else {
        console.error("Save button not found");
    }
}

manageSubmission();
