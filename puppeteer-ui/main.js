const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const puppeteer = require('puppeteer-core');
const fs = require('fs');

let mainWindow;
let chromeProcess;
let browser = null;

exec('taskkill /F /IM chrome.exe', (err, stdout, stderr) => {
    console.log('Clearing ...');
    if (err) {
        console.error('Error clearing Chrome:', err);
    } else {
        console.log('Cleared successfully.');
    }
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 375,
        height: 812,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        if (chromeProcess) {
            chromeProcess.kill();
            chromeProcess = null;
        }
        app.quit();
    });
});

ipcMain.on('get-emails', (event) => {
    const emails = [
        'duongtddse172132@fpt.edu.vn',
        'anhptnse171173@fpt.edu.vn',
        'test@dozun.dng'
    ];
    event.reply('email-list', emails);
});

ipcMain.on('start-chrome', async (event, { email, password, subject, course }) => {
    const userDataDirMap = {
        'duongtddse172132@fpt.edu.vn': 'C:\\chrome-profiles\\user1',
        'anhptnse171173@fpt.edu.vn': 'C:\\chrome-profiles\\user2',
    };

    const userDataDir = userDataDirMap[email];
    if (!userDataDir) {
        console.error('User data directory not found for email:', email);
        return;
    }

    chromeProcess = exec(`"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="${userDataDir}"`);

    chromeProcess.on('close', () => {
        mainWindow.webContents.send('chrome-stopped');
    });

    setTimeout(async () => {
        try {
            const browser = await puppeteer.connect({
                browserURL: 'http://localhost:9222',
                headless: false,
            });

            // const pages = await browser.pages();
            // const page = pages[0];

            const page = await browser.newPage();

            await page.goto('https://fap.fpt.edu.vn/Default.aspx');

            await page.waitForSelector('#ctl00_mainContent_ddlCampus');
            console.log('Selecting FU-HoChiMinh campus ...');
            await page.select('#ctl00_mainContent_ddlCampus', '4');
            console.log('Selected FU-HoChiMinh campus.');

            await page.waitForSelector('#ctl00_mainContent_btnLogin');
            console.log('Signing Google ...');
            await page.click('#ctl00_mainContent_btnLogin');
            console.log('Signed Google.');

            if (!fs.existsSync(userDataDir)) {
                console.log('Profile not found. Proceeding with login.');

                await page.waitForSelector('input[type="email"]', { visible: true });
                await page.type('input[type="email"]', email, { delay: 100 });
                await page.click('#identifierNext');

                await page.waitForSelector('input[type="password"]', { visible: true });
                await page.type('input[type="password"]', password, { delay: 100 });
                await page.click('#passwordNext');
                console.log('Signing ...');

                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                console.log('Signed successfully.');         
            } 
            // else {
            //     console.log('Profile found. Skipping login process.');
            //     await page.waitForNavigation({ waitUntil: 'networkidle0' });
            // }

            await page.waitForSelector('a[href="FrontOffice/Courses.aspx"]');
            console.log('Redirecting ...');
            await page.click('a[href="FrontOffice/Courses.aspx"]');
            console.log('Redirected successfully.');

            console.log(`Redirecting ${subject} ...`);

            const rows = await page.$$('table tr');

            for (const row of rows) {
                const columns = await row.$$('td');
                if (columns.length > 1) {
                    const subjectText = await page.evaluate(el => el.textContent.trim(), columns[1]);
                    if (subject.includes(subjectText)) {
                        const moveLink = await row.$('a[title="Xin chuyen mon hoc nay sang lop khac"]');
                        if (moveLink) {
                            await moveLink.click();
                            console.log(`Redirected ${subject} successfully.`);
                            break;
                        }
                    }
                }
            }

            await page.waitForSelector('#ctl00_mainContent_dllCourse');
            console.log(`Selecting course to move ...`);
            await page.select('#ctl00_mainContent_dllCourse', course);
            console.log(`Selected course to move successfully.`);

            await page.waitForSelector('#ctl00_mainContent_btSave', { visible: true });
            console.log('Saving ...');

            page.on('dialog', async (dialog) => {
                const message = dialog.message();
                console.log(`Alert: ${message}`);

                if (message.includes('Bạn không thể chuyển tới lớp này')) {
                    console.log('Failed to move class. Accepting alert.');
                    await dialog.accept();

                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                    
                    const saveButton = await page.$('input[type="submit"][name="ctl00$mainContent$btSave"]');
                    if (saveButton) {
                        console.log("Retrying Save button...");
                        await saveButton.click();
                    } else {
                        console.error("Save button not found!");
                    }
                } else {
                    console.log('No failure. Accepting alert.');
                    await dialog.accept();
                }
            });

            const saveButton = await page.$('input[type="submit"][name="ctl00$mainContent$btSave"]');
            if (saveButton) {
                console.log("Clicking Save button...");
                await saveButton.click();
            } else {
                console.error("Save button not found!");
            }

            // await page.waitForSelector('table#ctl00_mainContent_gvCourses');

            // const rows = await page.$$('#ctl00_mainContent_gvCourses tr');

            // console.log('Redirecting ...');

            // for (let row of rows) {
            //     const subjectCodeCell = await row.$('td:first-child');
            //     if (subjectCodeCell) {
            //         const subjectCodeText = await page.evaluate(el => el.innerText.trim(), subjectCodeCell);
            //         if (subjectCodeText === subjectCode) { 
            //             console.log(`Found subject code ${subjectCode}.`);

            //             const moveClassLink = await row.$('a#ctl00_mainContent_gvCourses_ctl02_lkMoveGroup');
            //             if (moveClassLink) {
            //                 await moveClassLink.click();
            //                 console.log('Redirected.');
            //                 break;
            //             }
            //         } else {
            //             console.log(`Not found subject code ${subjectCode}.`);
            //         }
            //     }
            // }
        } catch (error) {
            console.error('Error during automation:', error.message);
        }
    }, 3000);
});

ipcMain.on('stop-chrome', () => {
    if (chromeProcess) {
        console.log("Stopping ...");
        exec('taskkill /F /IM chrome.exe', (err, stdout, stderr) => {
            if (err) {
                console.error('Error stopping Chrome:', err);
            } else {
                console.log('Stopped successfully.');
            }
        });
        chromeProcess.kill();
        chromeProcess = null;
    }
});
