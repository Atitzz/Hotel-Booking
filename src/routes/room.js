const express = require("express");
const router = express.Router();
const controller = require("../controller/room");
const auth = require("../middleware/auth");
const uploadRoomImg = require("../middleware/upload");

router.get("/", controller.index);

router.get("/rooms", controller.showRooms);
router.get("/addRoom", auth, controller.formAddRoom);
router.post("/addRoom", auth, uploadRoomImg, controller.addRoom);

router.get("/booking/room/:roomID", controller.formBookingRoom);
router.post("/booking/room/:roomID", controller.bookingRoom);
router.get("/pagePayment", controller.pagePayment);
router.post("/payment", controller.payment);

router.get("/checkOut", auth, controller.formCheckOut);
router.post("/checkOut", auth, controller.checkOut);

router.get("/searchTypeRoom/", controller.searchTypeRoom);
router.get("/search/", controller.search);

module.exports = router;
