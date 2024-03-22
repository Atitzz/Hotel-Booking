const express = require('express');
const router = express.Router();
const controller = require('../controller/room');
const auth = require("../middleware/auth");
const { uploadHotelImg, uploadRoomImg } = require('../middleware/upload');

router.get('/', controller.index);

router.get('/allHotel', controller.hotels);
router.get('/hotel/:id', controller.seeMoreHotel);
router.get('/addHotel', auth, controller.formAddHotel);
router.post('/addHotel', auth, uploadHotelImg, controller.addHotel)

router.get('/showRooms', controller.showRooms);
router.get('/addRoom/hotel/:id', auth, controller.formAddRoom);
router.post('/addRoom/hotel/:id', auth, uploadRoomImg, controller.addRoom);

router.get('/booking/hotel/:hotelID/room/:roomID',auth, controller.formBookingRoom)
router.post('/booking/hotel/:hotelID/room/:roomID',auth, controller.bookingRoom)
router.get('/pagePayment', auth, controller.pagePayment);
router.post('/payment', auth, controller.payment);

router.get('/search/', controller.search);




module.exports = router