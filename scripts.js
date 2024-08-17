    function autoSave() {
        //click Save
        document.getElementById("ctl00_mainContent_btSave").click();

        //kiểm tra thành công
        const intervalId = setInterval(function() {
            if (successElement && successElement.innerText.includes(successMessage)) {
                console.log("Đổi lớp thành công !!");
                clearInterval(intervalId);
            }
        }, 1000); 
    }

    autoSave();
