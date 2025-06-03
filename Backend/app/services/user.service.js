const { ObjectId } = require("mongodb");
const User = require("../models/user.model");
const brcypt = require("bcrypt");

class userService {
  async createUser(payload) {
    // const exitUser = await User.findOne({
    //   $or: [{ email: User.email }, { tendangnhap: User.tendangnhap }],
    // });

    // if (exitUser) {
    //   throw new Error("Người dùng đã tồn tại.");
    // }

    const existing = await User.findOne({
      $or: [{ email: payload.email }, { tendangnhap: payload.tendangnhap }],
    });

    if (existing) {
      throw new Error("Người dùng đã tồn tại");
    }

    const salt = await brcypt.genSalt(10);
    payload.password = await brcypt.hash(payload.password, salt);

    const newUser = new User(payload);
    const savedUser = await newUser.save();

    const userObj = savedUser.toObject();
    delete userObj.password;

    return userObj;
  }

  async getUserByUsername(username) {
    try {
      const existUser = await User.findOne({
        tendangnhap: username,
      });

      if (existUser) return existUser;
      else {
        throw new Error("Người dùng không tồn tại");
      }
    } catch (error) {
      throw new Error("lỗi khi tìm người dùng", error);
    }
  }

  async getUserByToken(username) {
    try {
      const existUser = await User.findOne({
        tendangnhap: username,
      });

      if (existUser) return existUser;
      else {
        throw new Error("Người dùng không tồn tại");
      }
    } catch (error) {
      throw new Error("lỗi khi tìm người dùng", error.message);
    }
  }

  async updateUser(id, payload) {
    try {
      const updated = await User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        throw new Error("Không tìm thấy người dùng để cập nhật.");
      }
      return updated;
    } catch (error) {
      console.error("Chi tiết lỗi khi cập nhật:", error);
      throw new Error("Lỗi khi cập nhật: " + error.message);
    }
  }
}

module.exports = userService;
