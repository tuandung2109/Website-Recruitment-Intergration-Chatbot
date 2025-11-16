const { listAccount } = require("./controllers/account");

/**
 * Mock request/response objects
 */
const mockRes = {
  status: function (code) {
    this.statusCode = code;
    return this;
  },
  json: function (data) {
    console.log("\n✅ Kết quả từ listAccount:");
    console.log("═══════════════════════════════════════════════════════");
    console.log(JSON.stringify(data, null, 2));
    console.log("═══════════════════════════════════════════════════════\n");
    return this;
  },
};

const mockReq = {};

/**
 * Chạy hàm listAccount
 */
const testListAccount = async () => {
  try {
    console.log("📋 Đang lấy danh sách account...\n");
    await listAccount(mockReq, mockRes);
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
};

// Chạy hàm test
testListAccount();
