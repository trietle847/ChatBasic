const multer = require("multer");

const storage = multer.memoryStorage(); // không lưu vào ổ đĩa
const uploadSupabase = multer({ storage });

module.exports = uploadSupabase;
