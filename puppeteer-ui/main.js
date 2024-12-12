const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const puppeteer = require('puppeteer-core');
const fs = require('fs');

let mainWindow;
let chromeProcess;

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

ipcMain.on('start-chrome', async (event, { email, password }) => {
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
        const browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
        });

        try {
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

            //Check xem coi co ton tai san profile user chua
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
            } else {
                console.log('Profile found. Skipping login process.');
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
            }
        } catch (error) {
            console.error('Error during automation:', error.message);
        }
    }, 3000);
});

ipcMain.on('stop-chrome', () => {
    if (chromeProcess) {
        chromeProcess.kill();
        chromeProcess = null;
    }
});
