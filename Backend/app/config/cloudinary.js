const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dyuvfrjwv",
  api_key: "975156737418513",
  api_secret: process.env.SECRET_KEY_CLOUDINARY, 
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  },
});

module.exports = { cloudinary, storage };
