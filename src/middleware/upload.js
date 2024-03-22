const multer = require("multer");

const storageHotel = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/hotels');
  },
  filename: function (req, file, cb) {
    cb(null, "hotel-" + Date.now() + "-" + file.originalname);
  }
});

const uploadHotelImg = multer({ storage: storageHotel }).single('img');

const storageRoom = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/Rooms');
  },
  filename: function (req, file, cb) {
    cb(null, "room-" + Date.now() + "-" + file.originalname);
  }
});

const uploadRoomImg = multer({ storage: storageRoom }).single('img');

module.exports = { uploadHotelImg, uploadRoomImg }
