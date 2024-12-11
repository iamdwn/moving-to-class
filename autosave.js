const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
    });

    const pages = await browser.pages();
    const page = pages[0];

    // Lắng nghe hộp thoại
    page.on('dialog', async (dialog) => {
        const message = dialog.message();
        console.log(`Hộp thoại xuất hiện: ${message}`);

        if (message.includes('Bạn không thể chuyển tới lớp này')) {
            console.log('Thông báo không thể chuyển lớp. Tiếp tục nhấn Save...');
            await dialog.accept(); // Nhấn OK trong hộp thoại
            
            // Thay thế waitForTimeout bằng setTimeout trong Promise
            await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây

            const saveButton = await page.$('input[value="Save"]');
            if (saveButton) {
                console.log("Tìm thấy nút Save. Đang tự động nhấn...");
                await saveButton.click();
            }
        } else {
            console.log('Đã gặp thông báo khác. Đang dừng...');
            await dialog.accept(); // Nhấn OK
            await browser.close(); // Đóng trình duyệt
        }
    });

    // Nhấn Save lần đầu tiên
    const saveButton = await page.$('input[value="Save"]');
    if (saveButton) {
        console.log("Tìm thấy nút Save. Đang tự động nhấn...");
        await saveButton.click();
    } else {
        console.error("Không tìm thấy nút Save.");
    }

    console.log("Hoàn thành script!");
})();
