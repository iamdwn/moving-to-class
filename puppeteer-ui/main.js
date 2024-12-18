const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const puppeteer = require('puppeteer-core');
const fs = require('fs');

let mainWindow;
let browser = null;
let isCleared = false;
let chromeProcess = null;
let chromePort = 9222;

// exec('taskkill /F /IM chrome.exe', (err, stdout, stderr) => {
//     try {
//         console.log('Clearing ...');
//         console.log('Cleared successfully.');
//     } catch {
//     }
// });

let loginWindow;
let userData;

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 550,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    });

    loginWindow.loadFile('login.html');
}

function createCourseWindow(data) {
    mainWindow = new BrowserWindow({
        width: 550,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('init-data', data);
    });
}

app.whenReady().then(createLoginWindow);

ipcMain.on('login-success', (event, data) => {
    if (loginWindow) loginWindow.close();

    createCourseWindow(data);
});

app.on('ready', () => {
    const log = console.log;
    console.log = (...args) => {
        log(...args);
        mainWindow.webContents.send('console-log', args.join(' '), isCleared);
    };
});

ipcMain.on('get-emails', (event) => {
    const emails = [
        'duongtddse172132@fpt.edu.vn',
        'anhptnse171173@fpt.edu.vn',
        'test@dozun.dng'
    ];
    event.reply('email-list', emails);
});

ipcMain.on('start-chrome', async (event, { email, password, subject, course, timeout }) => {
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
                args: [
                    '--remote-debugging-port=${chromePort}',
                    '--window-size=100,100', '--window-position=1920,1080',
                    // '--use-gl=desktop',
                    // '--disable-background-timer-throttling',
                    // '--disable-renderer-backgrounding',
                    // '--disable-backgrounding-occluded-windows', 
                    // '--force-renderer-accessibility', 
                ]
            });
            browserInstance = browser;

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

            try {
                await page.waitForSelector('a[href="FrontOffice/Courses.aspx"]', { timeout: 2000 });
                console.log('Redirecting ...');
                await page.click('a[href="FrontOffice/Courses.aspx"]');
                console.log('Redirected successfully.');
                redirectSuccess = true;
            } catch (error) {
                console.log('Having some notifications.');
            
                try {
                    await page.waitForSelector('a.btn.btn-success[href="Student.aspx"]', { timeout: 2000 });
                    await page.click('a.btn.btn-success[href="Student.aspx"]');
            
                    await page.waitForSelector('a[href="FrontOffice/Courses.aspx"]', { timeout: 2000 });
                    console.log('Redirecting ...');
                    await page.click('a[href="FrontOffice/Courses.aspx"]');
                    console.log('Redirected successfully.');
                    redirectSuccess = true;
                } catch (innerError) {
                    console.log('Redirected failed.');
                }
            }

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

            let count = 0;

            page.on('dialog', async (dialog) => {
                const message = dialog.message();
                isCleared = true;

                if (message.includes('Bạn không thể chuyển tới lớp này')) {
                    console.log(`Alert: ${message}` + `\nFailed. Retrying ...` + `\nCount: ${count}`);
                    await dialog.accept();

                    await new Promise(resolve => setTimeout(resolve, timeout)); 
                    
                    const saveButton = await page.$('input[type="submit"][name="ctl00$mainContent$btSave"]');
                    if (saveButton) {
                        await saveButton.click();
                    } else {
                        console.error("Save button not found!");
                    }
                    count++;                  
                } else {
                    console.log('Moving ...\nMoving successfully.');
                    await dialog.accept();
                    stopChromeByPort(chromePort, true);
                }
            });

            const saveButton = await page.$('input[type="submit"][name="ctl00$mainContent$btSave"]');
            if (saveButton) {
                console.log("Moving ...");
                await saveButton.click();
            } else {
                console.error("Save button not found!");
            }
        } catch (error) {
            console.error('Error during automation:', error.message);
        }
    }, 3000);
});

ipcMain.on('stop-chrome', () => {
    // if (chromeProcess) {
    //     exec('taskkill /F /IM chrome.exe', (err, stdout, stderr) => {
    //         try {
    //             console.log('Stopping ...' + '\nStopped successfully.');
    //         } catch {
    //         }
    //     });
    //     chromeProcess.kill();
    //     chromeProcess = null;
    // }
    stopChromeByPort(chromePort);
});

function stopChromeByPort(port, isSuccess = false) {
    if (!isSuccess)
        console.log(`Finding ${port}...\nFound successfully.`);
    //find process with port using netstat and taskkill
    exec(`netstat -ano | findstr :${port}`, (err, stdout, stderr) => {
        if (err || !stdout) {
            console.error(`Not found any process with ${port}.`);
            return;
        }

        //get PID from netstat
        const lines = stdout.split('\n').filter(line => line.includes(`:${port}`));
        if (lines.length === 0) {
            console.log(`Not found any process with ${port}.`);
            return;
        }

        const pid = lines[0].trim().split(/\s+/).pop(); //get final PID

        //stop PID
        exec(`taskkill /PID ${pid} /F`, (killErr, killStdout, killStderr) => {
            if (killErr) {
                console.error(`Cannot stop PID ${pid}: ${killStderr}`);
                return;
            }
            if (!isSuccess)
                console.log(`Stopping ...\nStopped successfully.`);
        });
    });
}
