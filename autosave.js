const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        // defaultViewport: null,
        // headless: true,
    });

    const pages = await browser.pages();
    const page = pages[0];

    page.on('dialog', async (dialog) => {
        const message = dialog.message();
        console.log(`Alert: ${message}`);

        if (message.includes('Bạn không thể chuyển tới lớp này')) {
            console.log('Failed.\n==========================');
            await dialog.accept(); 

            await new Promise(resolve => setTimeout(resolve, 1000)); 

            const saveButton = await page.$('input[value="Save"]');
            if (saveButton) {
                console.log("Retrying ...");

                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout reached, exiting program.")), 3000));

                try {
                    await Promise.race([
                        saveButton.click(),
                        timeout
                    ]);
                } catch (error) {
                    console.error(error.message);
                    await browser.close();
                    process.exit(1);  
                }
            }
        } else {
            console.log('Successfully.\nClosing ...');
            await dialog.accept();
            await browser.close();
            process.exit(0); 
        }
    });

    const saveButton = await page.$('input[value="Save"]');
    if (saveButton) {
        console.log("Moving ...");
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout reached, exiting program.")), 3000));

        try {
            await Promise.race([
                saveButton.click(),
                timeout
            ]);
        } catch (error) {
            console.error(error.message);
            await browser.close();
            process.exit(1);  
        }
    } else {
        console.error("Error save");
        await browser.close();
        process.exit(1);  
    }

    console.log("Moving out class");
})();
