const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token xác thực." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // gắn thông tin người dùng
    next();
  } catch (err) {
    console.error("JWT Verify Error:", err.message);
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc hết hạn." });
  }
}

module.exports = authMiddleware;
