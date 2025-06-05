const { ObjectId } = require("mongodb");
const User = require("../models/user.model");
const brcypt = require("bcrypt");

class userService {
  async createUser(payload) {
    const existing = await User.findOne({
      $or: [{ email: payload.email }, { tendangnhap: payload.tendangnhap }, {sdt: payload.sdt}],
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

  async getUserByUsername(keyword) {
    try {
      const words = keyword.trim().split(/\s+/);

      const regexConditions = words.map((word) => ({
        hoten: { $regex: word, $options: "i" },
      }));

      const users = await User.find({ $and: regexConditions });

      if (users.length > 0) return users;
      else throw new Error("Không tìm thấy người dùng phù hợp");
    } catch (error) {
      throw new Error("Lỗi khi tìm người dùng: " + error.message);
    }
  }

  async getUserById(id) {
    try {
      const existUser = await User.findOne({
        _id: new ObjectId(id),
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

  async seachUserByPhone(phone) {
    try {
      const existUser = await User.findOne({
        sdt: phone,
      });

      if (existUser) return existUser;
      else {
        throw new Error("Người dùng không tồn tại");
      }
    } catch (error) {
      throw new Error("lỗi khi tìm người dùng", error);
    }
  }
}

module.exports = userService;
