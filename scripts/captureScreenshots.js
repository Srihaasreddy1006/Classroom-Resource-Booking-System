const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = path.join(__dirname, '../screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('--- Launching Headless Browser for UI Screenshots ---');
  console.log('Browser:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Landing Page
  console.log('Capturing 01_landing_page.png...');
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '01_landing_page.png') });

  // 2. Resource Catalog
  console.log('Capturing 02_resource_catalog.png...');
  await page.goto('http://localhost:5000/classrooms.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '02_resource_catalog.png') });

  // 3. Authenticate User First
  console.log('Authenticating as user@college.edu...');
  const userLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@college.edu', password: 'User@123' })
  }).then(r => r.json());

  if (userLoginRes.success) {
    await page.goto('http://localhost:5000/login.html');
    await page.evaluate((token, user) => {
      localStorage.setItem('crbs_token', token);
      localStorage.setItem('crbs_user', JSON.stringify(user));
    }, userLoginRes.token, userLoginRes.user);

    // 3. Booking Interface (with pre-filled fields)
    console.log('Capturing 03_booking_interface.png...');
    await page.goto('http://localhost:5000/booking.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // Fill sample values in booking form for realistic preview
    await page.evaluate(() => {
      const roomSelect = document.getElementById('classroomSelect');
      if (roomSelect && roomSelect.options.length > 1) {
        roomSelect.selectedIndex = 1;
        roomSelect.dispatchEvent(new Event('change'));
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const dateEl = document.getElementById('bookingDate');
      if (dateEl) {
        dateEl.value = tomorrow.toISOString().split('T')[0];
        dateEl.dispatchEvent(new Event('change'));
      }
      const attendeesEl = document.getElementById('attendees');
      if (attendeesEl) attendeesEl.value = '45';
      const purposeEl = document.getElementById('purpose');
      if (purposeEl) purposeEl.value = 'Full-Stack Web Technology Workshop & Practical Demo';
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, '03_booking_interface.png') });

    // 4. User Dashboard
    console.log('Capturing 04_user_dashboard.png...');
    await page.goto('http://localhost:5000/student-dashboard.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUT_DIR, '04_user_dashboard.png') });
  }

  // 5. Admin Dashboard (Authenticated as admin@college.edu)
  console.log('Capturing 05_admin_dashboard.png...');
  const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'Admin@123' })
  }).then(r => r.json());

  if (adminLoginRes.success) {
    await page.goto('http://localhost:5000/login.html');
    await page.evaluate((token, user) => {
      localStorage.setItem('crbs_token', token);
      localStorage.setItem('crbs_user', JSON.stringify(user));
    }, adminLoginRes.token, adminLoginRes.user);
    await page.goto('http://localhost:5000/admin-dashboard.html', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUT_DIR, '05_admin_dashboard.png') });
  }

  await browser.close();
  console.log('✅ All 5 UI screenshots successfully captured in screenshots/ directory!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
