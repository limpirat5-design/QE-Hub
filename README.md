# Branch Hub - ระบบศูนย์รวมงานและลิงก์สาขา (QE Hub)

ระบบเว็บพอร์ทัลรวมลิงก์ประจำวันสำหรับเจ้าหน้าที่สาขา สไตล์ **Pure Neumorphic Soft UI** เชื่อมต่อฐานข้อมูลคลาวด์ **Google Sheets** แบบ Real-Time โดยไม่ต้องใช้รหัสผ่าน พร้อมระบบแจ้งเตือนกำหนดเวลาส่งงาน และระบบประวัติการใช้งาน (Audit Log)

🌐 **Live Website (GitHub Pages):** [https://limpirat5-design.github.io/QE-Hub/](https://limpirat5-design.github.io/QE-Hub/)

---

## 🌟 ฟีเจอร์เด่น (Key Features)

1. **Pure Neumorphism (Soft UI) & Responsive Design**
   - ดีไซน์นุ่มนวล ทันสมัย ผ่านมาตรฐาน Accessibility สบายตาต่อการทำงานทั้งวัน
   - รองรับการใช้งานทั้งคอมพิวเตอร์สำนักงาน, แท็บเล็ต iPad และสมาร์ตโฟน
   - โหมดสว่าง / โหมดมืด (Dark / Light Theme Toggle)

2. **ระบบฐานข้อมูลคลาวด์ Google Sheets (No-Admin Required)**
   - ข้อมูลลิงก์เชื่อมต่อกับ Google Sheets โดยตรงผ่าน Google Apps Script Web App
   - เพิ่ม, แก้ไข หรือลบลิงก์ได้อิสระจากหน้าเว็บ และข้อมูลจะอัปเดตตรงกันทุกสาขาแบบเรียลไทม์
   - มีระบบสำรองข้อมูลออฟไลน์ (Local Cache) ในกรณีที่ไม่มีสัญญาณอินเทอร์เน็ต

3. **ระบบนาฬิกาและแจ้งเตือนด่วนตามกำหนดเวลา (Schedule & Urgent Alerts)**
   - นาฬิกาดิจิทัลแบบ 24 ชั่วโมงแบบเรียลไทม์
   - นับถอยหลังและกะพริบแจ้งเตือนด่วนอัตโนมัติเมื่อถึงช่วงเวลาส่งงาน (เช่น รอบเช้า 09:00 น. และรอบเย็น 17:00 / 17:30 น.)

4. **ระบบ QR Code สำหรับลูกค้า**
   - ทุกรายการสามารถกดเปิดแสดง QR Code ขยายใหญ่บนหน้าจอ เพื่อยื่นให้ลูกค้าหรือเจ้าหน้าที่สแกนผ่านมือถือได้ทันที

5. **ระบบบันทึกประวัติการใช้งานแบบคลาวด์ (Cloud Audit Log)**
   - ป๊อปอัปตรวจสอบย้อนหลังว่าใครเป็นผู้เพิ่ม, แก้ไข หรือลบข้อมูลเวลาใด
   - บันทึกลงในแผ่นงาน `AuditLogs` บน Google Sheets กลางโดยอัตโนมัติ
   - ปุ่มดาวน์โหลดประวัติเป็นไฟล์ CSV สำหรับเปิดดูในโปรแกรม Excel

---

## 📁 โครงสร้างโปรเจกต์ (File Structure)

```
QR-Hub/
├── index.html                                 # หน้าเว็บหลักสำหรับ GitHub Pages
├── branch_daily_portal_quick_links_dashboard.html # ไฟล์ต้นฉบับ Dashboard
├── google_apps_script.js                      # โค้ด Backend สำหรับติดตั้งบน Google Apps Script
└── README.md                                  # เอกสารแนะนำระบบ
```

---

## 🚀 การติดตั้งและเปิดใช้งาน GitHub Pages

1. เข้าไปที่คลังข้อมูลบน GitHub: `https://github.com/limpirat5-design/QE-Hub`
2. ไปที่เมนู **Settings** -> **Pages**
3. ที่หัวข้อ **Build and deployment** -> เลือก Branch: `main` (หรือ `master`) และ Folder: `/ (root)`
4. กดปุ่ม **Save**
5. รอระบบประมวลผลประมาณ 1-2 นาที เว็บไซต์จะเปิดใช้งานได้ที่ `https://limpirat5-design.github.io/QE-Hub/`
