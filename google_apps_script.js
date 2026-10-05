/**
 * ====================================================================
 * Branch Hub - Google Sheets Data Backend (No Password Required)
 * ระบบเชื่อมต่อข้อมูลลิงก์สาขา พร้อมระบบบันทึกประวัติ (Audit Log) อัตโนมัติ
 * ====================================================================
 * 
 * วิธีอัปเดตโค้ดบน Google Sheets:
 * 1. เปิดไฟล์ Google Sheets เดิมของคุณ
 * 2. ไปที่เมนู "ส่วนขยาย (Extensions)" -> "Apps Script"
 * 3. ลบโค้ดเดิมออกทั้งหมด แล้ววางโค้ดในไฟล์นี้ลงไปแทน
 * 4. กดปุ่ม "บันทึก (Save รูปแผ่นดิสก์)"
 * 5. กดปุ่ม "ทำให้ใช้งานได้ (Deploy)" ด้านบนขวา -> เลือก "จัดการการปรับใช้ (Manage deployments)"
 * 6. กดรูปดินสอ (Edit) ด้านบนขวา -> ที่ช่อง "เวอร์ชัน (Version)" เลือก "เวอร์ชันใหม่ (New version)"
 * 7. กดปุ่ม "ทำให้ใช้งานได้ (Deploy)"
 */

const SHEET_NAME = "Links";
const LOG_SHEET_NAME = "AuditLogs";

// โครงสร้างคอลัมน์มาตรฐานสำหรับลิงก์
const HEADERS = [
  "id",
  "title",
  "category",
  "icon",
  "url",
  "desc",
  "qrUrl",
  "scheduleDay",
  "dueTime",
  "dueTime2",
  "pinned",
  "updatedAt",
  "updatedBy"
];

/**
 * 1. ฟังก์ชันสร้าง Sheet รายการลิงก์อัตโนมัติหากยังไม่มี
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#0d9488");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 2. ฟังก์ชันสร้าง Sheet บันทึกประวัติ (AuditLogs) อัตโนมัติหากยังไม่มี
 */
function getOrCreateLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET_NAME);
    sheet.appendRow([
      "วันเวลา (Timestamp)",
      "ประเภท (Action)",
      "ชื่องาน / รายการ (Title)",
      "ผู้ทำรายการ (User)",
      "รายละเอียดเพิ่มเติม (Detail)"
    ]);
    const headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setBackground("#0f766e");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    try {
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 130);
      sheet.setColumnWidth(3, 240);
      sheet.setColumnWidth(4, 150);
      sheet.setColumnWidth(5, 320);
    } catch (e) {}
  }
  return sheet;
}

/**
 * 3. บันทึกแถวใหม่ลงในแท็บ AuditLogs
 */
function recordAuditLog(type, title, user, detail) {
  try {
    const sheet = getOrCreateLogSheet();
    const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
    
    let typeText = "บันทึกข้อมูล";
    if (type === "add") typeText = "➕ เพิ่มรายการ";
    else if (type === "edit") typeText = "✏️ แก้ไขรายการ";
    else if (type === "delete") typeText = "🗑️ ลบรายการ";
    else if (type === "syncAll") typeText = "🔄 ซิงค์ทั้งหมด";

    sheet.appendRow([
      timestamp,
      typeText,
      title || "ไม่ระบุชื่องาน",
      user || "เจ้าหน้าที่สาขา",
      detail || ""
    ]);
  } catch (err) {
    console.warn("Could not record audit log:", err);
  }
}

/**
 * 4. อ่านประวัติ 50 รายการล่าสุดจากแท็บ AuditLogs
 */
function getAuditLogsFromSheet(limit) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return [];

    const maxItems = limit || 50;
    const logs = [];
    
    // วนลูปอ่านจากล่างขึ้นบน (แถวล่าสุดก่อน)
    for (let i = data.length - 1; i >= 1 && logs.length < maxItems; i--) {
      const row = data[i];
      let rawType = "edit";
      if (row[1].indexOf("เพิ่ม") !== -1) rawType = "add";
      else if (row[1].indexOf("ลบ") !== -1) rawType = "delete";

      logs.push({
        id: "cloud-log-" + i,
        timeFormatted: row[0],
        type: rawType,
        typeLabel: row[1],
        title: row[2],
        user: row[3],
        detail: row[4]
      });
    }
    return logs;
  } catch (err) {
    return [];
  }
}

/**
 * 5. ดึงข้อมูลทั้งหมด (HTTP GET)
 * ส่งทั้งรายการลิงก์ (data) และประวัติล่าสุด (logs) กลับไปหน้าเว็บ
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const displayData = sheet.getDataRange().getDisplayValues();
    
    const items = [];
    if (data.length > 1) {
      const headers = data[0];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; // ข้ามแถวที่ไม่มี ID

        const item = {};
        headers.forEach((key, colIndex) => {
          let val = displayData[i][colIndex];
          if (key === "pinned") {
            val = (row[colIndex] === true || row[colIndex] === "true" || row[colIndex] === 1 || String(row[colIndex]).toLowerCase() === "true");
          }
          item[key] = val;
        });
        items.push(item);
      }
    }

    // ดึงประวัติล่าสุดจากแท็บ AuditLogs
    const logs = getAuditLogsFromSheet(50);

    return createJsonResponse({
      status: "success",
      count: items.length,
      data: items,
      logs: logs
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * 6. บันทึก / แก้ไข / ลบ ลิงก์ (HTTP POST)
 * ใครก็ตามที่กดบันทึกบนหน้าเว็บ ระบบจะส่งมาอัปเดตและบันทึกประวัติลง AuditLogs อัตโนมัติ
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let contents = {};
    
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      contents = e.parameter;
    }

    const action = contents.action; // 'save', 'delete', 'syncAll', 'log'
    const user = contents.user || "เจ้าหน้าที่สาขา";
    const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    // กรณีส่งบันทึกประวัติอย่างเดียว
    if (action === "log") {
      recordAuditLog(contents.type || "edit", contents.title, user, contents.detail || "");
      return createJsonResponse({ status: "success", message: "บันทึกประวัติสำเร็จ" });
    }

    // กรณีส่งข้อมูลทั้งชุดมาแทนที่ (Sync ทั้งหมด)
    if (action === "syncAll" && Array.isArray(contents.items)) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      const rowsToAdd = contents.items.map(item => [
        item.id || ("item-" + Date.now()),
        item.title || "",
        item.category || "other",
        item.icon || "link",
        item.url || "",
        item.desc || "",
        item.qrUrl || "",
        item.scheduleDay || "",
        item.dueTime || "",
        item.dueTime2 || "",
        item.pinned ? true : false,
        timestamp,
        user
      ]);

      if (rowsToAdd.length > 0) {
        sheet.getRange(2, 1, rowsToAdd.length, HEADERS.length).setValues(rowsToAdd);
      }

      // บันทึกลง AuditLogs
      recordAuditLog("syncAll", "ซิงค์ข้อมูลชุดใหญ่", user, `อัปเดตข้อมูลทั้งหมด ${rowsToAdd.length} รายการ`);

      return createJsonResponse({
        status: "success",
        message: "บันทึกข้อมูลทั้งหมดขึ้น Google Sheets สำเร็จ",
        count: rowsToAdd.length
      });
    }

    // กรณีเพิ่มหรือแก้ไขรายการเดียว
    if (action === "save" && contents.item) {
      const item = contents.item;
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      let isEdit = false;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(item.id)) {
          rowIndex = i + 1;
          isEdit = true;
          break;
        }
      }

      const rowValues = [
        item.id || ("item-" + Date.now()),
        item.title || "",
        item.category || "other",
        item.icon || "link",
        item.url || "",
        item.desc || "",
        item.qrUrl || "",
        item.scheduleDay || "",
        item.dueTime || "",
        item.dueTime2 || "",
        item.pinned ? true : false,
        timestamp,
        user
      ];

      if (isEdit && rowIndex > 1) {
        sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([rowValues]);
        recordAuditLog("edit", item.title, user, `แก้ไขข้อมูลลิงก์ (หมวด: ${item.category || 'ทั่วไป'})`);
        return createJsonResponse({ status: "success", message: `แก้ไข "${item.title}" เรียบร้อยแล้ว` });
      } else {
        sheet.appendRow(rowValues);
        recordAuditLog("add", item.title, user, `เพิ่มลิงก์ใหม่ (หมวด: ${item.category || 'ทั่วไป'})`);
        return createJsonResponse({ status: "success", message: `เพิ่ม "${item.title}" เรียบร้อยแล้ว` });
      }
    }

    // กรณีลบรายการ
    if (action === "delete" && contents.id) {
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      let deletedTitle = "";

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(contents.id)) {
          deletedTitle = data[i][1] || contents.id;
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      if (deleted) {
        recordAuditLog("delete", deletedTitle, user, "ลบรายการออกจากหน้าเว็บ");
        return createJsonResponse({ status: "success", message: "ลบรายการเรียบร้อยแล้ว" });
      } else {
        return createJsonResponse({ status: "error", message: "ไม่พบรายการที่ต้องการลบ" });
      }
    }

    return createJsonResponse({ status: "error", message: "ไม่พบคำสั่งที่ระบุ" });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * 7. ตัวช่วยแปลงผลลัพธ์เป็น JSON สำหรับส่งกลับหน้าเว็บ
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
