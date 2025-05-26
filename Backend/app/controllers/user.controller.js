const { MongoClient } = require("mongodb");
const MongoDB = require("../utils/mongodb.util");
const UserService = require("../services/user.service");
const ApiError = require("../api-error");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

exports.create = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const doc = await userService.createUser(req.body);

    return res.send({
      message: "Tạo người dùng thành công",
      user: doc,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi thêm người dùng: ${error.message}`));
  }
};

exports.getUserByUsername = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);
    const result = await userService.getUserByUsername(req.body.tendangnhap);

    if (result)
      return res.send({
        message: "Thông tin người dùng",
        user: result,
      });
  } catch (error) {
    return next(new ApiError(500, ` Lỗi khi lấy người dùng`, error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { tendangnhap, password } = req.body;

    const userService = new UserService(MongoDB.client);
    const user = await userService.getUserByUsername(tendangnhap);

    if (!user) {
      return next(new ApiError(401, ` Không tồn tại người dùng`));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ApiError(404, ` Mật khẩu không đúng`));
    }

    const token = jwt.sign(
      {
        userId: user._id,
        tendangnhap: user.tendangnhap,
      },
      SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    return res.send({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        hoten: user.hoten,
        email: user.email,
        tendangnhap: user.tendangnhap,
      }
    })
  } catch (error) {
    return next(new ApiError(500, ` Lỗi đăng nhập ${error.message}`));
  }
};

exports.update = async (req, res, next) => {
  try {
    const userService = new UserService(MongoDB.client);

    const id = req.user.userId;
    const updateData = req.body;

    const result = await userService.updateUser(id,updateData);
    console.log(updateData)
    console.log(id)

    return res.send({
      message: "Cập nhật thành công",
      result,
    })
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi sửa người dùng: ${error.message}`));
  }
};
