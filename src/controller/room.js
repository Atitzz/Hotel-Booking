const db = require("../models/index");
const { Op } = require("sequelize");
const stripe = require("stripe")(
  "sk_test_51NmzDjChq1rTBckY24CpBSgsHMmxHwB13u8EpUk7xkIc0hKbrxyRBLqzTTM1MbXtGLUiVC1uGSftXmLyEsn9UsZi000Pq80Ue5"
);
const day = require("dayjs");

// หน้าแรก
const index = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;

    const { roomType } = req.query;
    const roomFilter = roomType ? `WHERE type = ${roomType}` : "";
    const [rooms] = await db.sequelize.query(
      `
      SELECT DISTINCT ON (type) id, type, img, size
      FROM "Rooms"
      ${roomFilter}
      ORDER BY type
    `
    );

    // ไม่ต้องใช้ toJSON เพราะ sequelize.query คืนค่าเป็น object ธรรมดาอยู่แล้ว ไม่ใช่ sequelize object model
    // แปลงค่า img จาก JSON string เป็น array
    const showRoom = rooms.map((room) => {
      return {
        ...room,
        img: JSON.parse(room.img),
      };
    });
    showRoom.sort((a, b) => a.size - b.size);
    res.render("index", { user, showUser, checkTypeUser, showRoom });
  } catch (error) {
    console.log(error);
  }
};

// หน้าดูห้องที่มีทั้งหมด
const showRooms = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;

    const rooms = await db.Room.findAll({
      attributes: [
        "id",
        "type",
        "price",
        "status",
        "size",
        "img",
        "facilities",
      ],
    });

    // .toJSON() เป็น method ของ sequelize ใช้แปลง Object model เป็น Object json ธรรมดา
    // แปลงค่า img จาก JSON string เป็น array
    const showRoom = rooms.map((room) => {
      return {
        ...room.toJSON(),
        img: JSON.parse(room.img),
      };
    });

    res.render("showRooms", {
      user,
      showUser,
      showRoom,
      checkTypeUser,
    });
  } catch (error) {
    console.log(error);
  }
};

// หน้าแบบฟอร์มเพิ่มห้อง
const formAddRoom = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;
    const message = req.flash("success");

    res.render("addRoom", { user, showUser, message, checkTypeUser });
  } catch (error) {
    console.log(error);
  }
};

// เพิ่มห้อง
const addRoom = async (req, res) => {
  try {
    const { type, size, price, status, facilities } = req.body;
    // const roomImage = req.file ? req.file.filename : null;
    const roomImages = req.files ? req.files.map((file) => file.filename) : [];

    // หากมีเกิน 1 ตัวเลือก ให้แปลงเป็น array เก็บใน DB
    const facilitiesString = Array.isArray(facilities)
      ? facilities.join(", ")
      : facilities;

    const newRoom = await db.Room.create({
      type,
      size,
      price,
      img: JSON.stringify(roomImages),  //เก็บไฟล์รูปเป็น json string
      status,
      facilities: facilitiesString,
    });
    req.flash("success", "Room created successfully");
    res.redirect("/rooms");
  } catch (error) {
    console.log(error);
  }
};

// หน้าแบบฟอร์มก่อนจองห้อง
const formBookingRoom = async (req, res) => {
  try {
    const showUser = req.cookies && req.cookies.user;
    const user = req.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;

    const { roomID } = req.params;
    const room = await db.Room.findOne({
      where: { id: roomID },
    });

    res.render("booking", { user, showUser, room, checkTypeUser });
  } catch (error) {
    console.log(error);
  }
};

// จองห้อง
const bookingRoom = async (req, res) => {
  try {
    const { username, roomId, price, startDate, endDate } = req.body;

    const booking = await db.Booking.create({
      roomId,
      username,
      startDate,
      endDate,
      status: "Confirm",
      paymentStatus: "Pending",
    });

    const room = await db.Room.findByPk(roomId);
    if (room) {
      await room.update({
        status: "Occupied",
        startDate,
        endDate,
      });
    }

    req.session.cart = {
      roomId,
      username,
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

// หน้าชำระเงิน
const pagePayment = async (req, res) => {
  try {
    const { roomId, username, price, startDate, endDate } = req.session.cart;
    res.render("pagePayment", {
      roomId,
      username,
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
      { paymentStatus: "Paid", checkOut: false },
      { where: { id: bookingId } }
    );

    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    throw error;
  }
};

const formCheckOut = async (req, res) => {
  try {
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;
    const user = req.user;
    const bookings = await db.Booking.findAll({
      where: {
        [Op.and]: [
          { paymentStatus: "Paid" },
          { checkOut: false },
          { "$roomBooking.status$": "Occupied" },
        ],
      },
      include: [
        {
          model: db.Room,
          as: "roomBooking",
        },
      ],
    });

    res.render("checkOut", {
      user,
      showUser,
      bookings,
      day: day,
      checkTypeUser,
    });
  } catch (error) {
    console.log(error);
  }
};

const checkOut = async (req, res) => {
  try {
    const { roomId } = req.body;
    const setRoom = await db.Room.findByPk(roomId);
    await db.Room.update(
      {
        status: "Available",
        startDate: null,
        endDate: null,
        checkOut: true,
      },
      { where: { id: roomId } }
    );
    await db.Booking.update({ checkOut: true }, { where: { roomId: roomId } });
    res.redirect("/rooms");
  } catch (error) {
    console.log(error);
  }
};

const searchTypeRoom = async (req, res) => {
  try {
    const user = req.cookies && req.cookies.jwt;
    const showUser = req.cookies && req.cookies.user;
    const checkTypeUser = showUser
      ? await db.User.findOne({ where: { username: showUser } })
      : null;

    const { roomType } = req.query;
    let showRoom = [];
    if (roomType) {
      showRoom = await db.Room.findAll({
        where: db.sequelize.where(
          db.sequelize.cast(db.sequelize.col("type"), "TEXT"),
          { [Op.iLike]: `${roomType}` }
        ),
      });
    } else {
      showRoom = await db.Room.findAll({});
    }
    // แปลงค่า img จาก JSON string เป็น array
    showRoom = showRoom.map((room) => {
      return {
        ...room.toJSON(),
        img: JSON.parse(room.img),
      };
    });

    res.render("showRooms", { user, showUser, checkTypeUser, showRoom });
  } catch (error) {
    console.log(error);
  }
};

// แถบค้นหา (การค้นหาวันที่ ต้องแปลงค่า)
const search = async (req, res) => {
  try {
    const { search, numGuest, checkIn, checkOut } = req.query;
    // const startDateCondition = checkIn ? { [Op.lt]: checkIn } : null;
    // const endDateCondition = checkOut ? { [Op.gt]: checkOut } : null;
    const startDate = checkIn ? new Date(checkIn) : null;
    const endDate = checkOut ? new Date(checkOut) : null;

    const rooms = await db.Room.findAll({
      where: {
        [Op.and]: [
          { type: { [Op.iLike]: `%${search}%` } },
          { status: "Available" },
          { size: { [Op.gte]: numGuest } },
          { startDate: { [Op.or]: { [Op.lt]: startDate, [Op.eq]: null } } },
          { endDate: { [Op.or]: { [Op.gt]: endDate, [Op.eq]: null } } },
        ],
      },
    });
    res.render("search", { rooms: rooms });
  } catch (error) {
    console.error(error);
    console.log(error);
  }
};

module.exports = {
  index,
  showRooms,
  formAddRoom,
  addRoom,
  formBookingRoom,
  bookingRoom,
  pagePayment,
  payment,
  searchTypeRoom,
  search,
  formCheckOut,
  checkOut,
};
