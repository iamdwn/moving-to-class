# I. Clone repository:

- Clone về theo đường dẫn:

```bash
git clone https://github.com/iamdwn/moving-to-class.git
```

# II. Cài thư viện:

- Vào thư mục repo vừa clone
- Mở `Terminal`
- Chạy lệnh sau để cài `Puppeteer`:

```bash
npm install puppeteer
```

- Mở chrome với `mode debugging`:

```bash
& "<Your_chrome.exe_path>" --remote-debugging-port=9222 --user-data-dir="C:\chrome-profile"
```

`Mặc định:`

```bash
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-profile"
```

`Explain:`

- `--remote-debugging-port=9222`: Bật chế độ gỡ lỗi
- `--user-data-dir="C:\chrome-profile`: Duy trì session và trạng thái đăng nhập

# III. Run

- Mở `Terminal` ngay tại thư mục chứa `autosave.js`
- Chạy lệnh:

```bash
node autosave.js
```

# IV. Chạy script bằng app installation:

- Vào folder `app-installation`
- Unzip folder `Moving To Class by Dozun vX.X.X`
- Run installation


