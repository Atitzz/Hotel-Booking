const db = require("../models/index");
const { Op } = require("sequelize");
const stripe = require("stripe")(
  "sk_test_51NmzDjChq1rTBckY24CpBSgsHMmxHwB13u8EpUk7xkIc0hKbrxyRBLqzTTM1MbXtGLUiVC1uGSftXmLyEsn9UsZi000Pq80Ue5"
);

// หน้าแรก
const index = (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const message = req.flash("success");

    res.render("index", { message, user, showUser });
  } catch (error) {
    console.log(error);
  }
};

// หน้าดูโรงแรมที่มีทั้งหมด
const hotels = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = req.cookies && req.cookies.type;
    const message = req.flash("success");

    const showHotel = await db.Hotel.findAll({
      attributes: ["id", "name", "address", "img"],
    });

    res.render("showHotels", {
      message,
      user,
      showUser,
      showHotel,
      checkTypeUser,
    });
  } catch (error) {
    console.log(error);
  }
};

// หน้าเข้าชมโรงแรม
const seeMoreHotel = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = req.cookies && req.cookies.type;

    const hotel = req.params.id;
    const showDetail = await db.Hotel.findOne({
      where: { id: hotel },
      attributes: ["id", "name", "address", "img"],
      include: [
        {
          model: db.Room,
          as: "rooms",
          attributes: [
            "id",
            "type",
            "price",
            "status",
            "size",
            "img",
            "facilities",
          ],
        },
      ],
    });

    res.render("seemoreHotel", { user, showUser, checkTypeUser, showDetail });
  } catch (error) {
    console.log(error);
  }
};

// หน้าแบบฟอร์มเพิ่มโรงแรม
const formAddHotel = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;

    res.render("addHotel", { user, showUser });
  } catch (error) {
    console.log(error);
  }
};

// เพิ่มโรงแรม
const addHotel = async (req, res) => {
  try {
    const { name, address } = req.body;
    const hotelImage = req.file ? req.file.filename : null;

    const newHotel = await db.Hotel.create({
      name,
      address,
      img: hotelImage,
    });
    req.flash("success", "Hotel created successfully");
    res.redirect("/allHotel");
  } catch (error) {
    console.log(error);
  }
};

// หน้าดูห้องที่มีทั้งหมด
const showRooms = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const message = req.flash("success");
    const showRoom = await db.Room.findAll({
      attributes: [
        "id",
        "type",
        "price",
        "status",
        "size",
        "img",
        "hotelId",
        "facilities",
      ],
      include: [
        {
          model: db.Hotel,
          as: "rooms",
          attributes: ["id", "name", "address", "img"],
        },
      ],
    });

    res.render("showRooms", { message, user, showUser, showRoom });
  } catch (error) {
    console.log(error);
  }
};

// หน้าแบบฟอร์มเพิ่มห้อง
const formAddRoom = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const message = req.flash("success");
    const numberHotel = req.params.id;
    const hotel = await db.Hotel.findByPk(numberHotel);

    res.render("addRoom", { user, showUser, message, hotel });
  } catch (error) {
    console.log(error);
  }
};

// เพิ่มห้อง
const addRoom = async (req, res) => {
  try {
    const { type, size, price, status, hotelId, facilities } = req.body;
    const roomImage = req.file ? req.file.filename : null;

    // หากมีเกิน 1 ตัวเลือก ให้แปลงเป็น array เก็บใน DB
    const facilitiesString = Array.isArray(facilities)
      ? facilities.join(", ")
      : facilities;

    const newRoom = await db.Room.create({
      type,
      size,
      price,
      img: roomImage,
      status,
      hotelId,
      facilities: facilitiesString,
    });
    req.flash("success", "Room created successfully");
    res.redirect("/showRooms");
  } catch (error) {
    console.log(error);
  }
};

// หน้าแบบฟอร์มก่อนจองห้อง
const formBookingRoom = async (req, res) => {
  try {
    const showUser = req.cookies && req.cookies.user;
    const user = req.user;

    const { roomID } = req.params;
    const room = await db.Room.findOne({
      where: { id: roomID },
      include: [
        {
          model: db.Hotel,
          as: "rooms",
          attributes: ["id", "name", "address"],
        },
      ],
    });

    res.render("booking", { user, showUser, room });
  } catch (error) {
    console.log(error);
  }
};

// จองห้อง
const bookingRoom = async (req, res) => {
  try {
    const { userId, roomId, price, startDate, endDate } = req.body;

    const booking = await db.Booking.create({
      roomId,
      userId,
      startDate,
      endDate,
      status: "Confirm",
      paymentStatus: "Pending",
    });

    const room = await db.Room.findByPk(roomId);
    if (room) {
      await room.update({ status: "Occupied" });
    }

    req.session.cart = {
      userId,
      roomId,
      price,
      startDate,
      endDate,
      bookingId: booking.id,
    };

    res.redirect("/pagePayment");
  } catch (error) {
    console.error(error);
  }
};

// แถบค้นหา
const search = async (req, res) => {
  try {
    // ดึงค่าที่ถูกส่งมาจากแบบฟอร์มผ่าน req.query
    const { location, numGuest, checkIn, checkOut } = req.query

    // ค้นหาข้อมูลโรงแรมที่ตรงกับเงื่อนไขในฐานข้อมูล
    const hotels = await db.Hotel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${location}%` } }, 
          { address: { [Op.iLike]: `%${location}%` } }
        ],
      },
      attributes: ["id", "name", "address", "img"], 
      include: [
        {
          model: db.Room,
          as: "rooms",
          where: {
            status: "Available",
          },
          attributes: [
            "id",
            "type",
            "price",
            "status",
            "size",
            "img",
            "facilities",
          ],
        },
      ],
    });

    res.render("searchResult", { hotels, location, numGuest, checkIn, checkOut });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


// หน้าชำระเงิน
const pagePayment = async (req, res) => {
  try {
    const { roomId, userId, price, startDate, endDate } = req.session.cart;
    res.render("pagePayment", {
      roomId,
      userId,
      price,
      startDate,
      endDate,
    });
  } catch (error) {
    console.log(error);
  }
};

// ชำระเงิน
const payment = async (req, res) => {
  try {
    const token = req.body.stripeToken;
    const amount = req.body.amount;
    const charge = stripe.charges.create({
      amount: amount,
      currency: "thb",
      source: token,
    });

    const bookingId = req.session.cart.bookingId;
    await db.Booking.update(
      { paymentStatus: "Paid" },
      { where: { id: bookingId } }
    );

    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    throw error;
  }
};

module.exports = {
  index,
  formAddHotel,
  addHotel,
  hotels,
  showRooms,
  formAddRoom,
  addRoom,
  seeMoreHotel,
  formBookingRoom,
  bookingRoom,
  pagePayment,
  payment,
  search,
};
