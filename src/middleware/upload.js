const multer = require("multer");

const storageRoom = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/Rooms');
  },
  filename: function (req, file, cb) {
    cb(null, "room-" + Date.now() + "-" + file.originalname);
  }
});

// const uploadRoomImg = multer({ storage: storageRoom }).single('img');
const uploadRoomImg = multer({ storage: storageRoom }).array('img', 10);

module.exports = uploadRoomImg;
