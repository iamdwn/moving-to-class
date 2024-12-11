const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
    });

    const pages = await browser.pages();
    const page = pages[0];

    page.on('dialog', async (dialog) => {
        const message = dialog.message();
        console.log(`Alert: ${message}`);

        if (message.includes('Bạn không thể chuyển tới lớp này')) {
            console.log('Failed. Moving ...');
            await dialog.accept(); 
            
            await new Promise(resolve => setTimeout(resolve, 1000)); 

            const saveButton = await page.$('input[value="Save"]');
            if (saveButton) {
                console.log("Saving ...");
                await saveButton.click();
            }
        } else {
            console.log('Successfully !!\n Closing ...');
            await dialog.accept();
            await browser.close(); 
        }
    });

    const saveButton = await page.$('input[value="Save"]');
    if (saveButton) {
        console.log("Saving ...");
        await saveButton.click();
    } else {
        console.error("Error save");
    }

    console.log("Moving out class");
})();
