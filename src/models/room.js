const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.hasOne(models.Booking, {
        foreignKey: "roomId",
      });
      Room.belongsTo(models.Hotel, {
        foreignKey: "hotelId",
        as: 'rooms'
      });
    }
  }
  Room.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM(   //ประเภทห้อง
          "Standard Room",
          "Superior Room",
          "Deluxe Room",
          "Suite Room"
        ), 
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Available", "Occupied"), //สถานะของห้อง
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING, //จุได้กี่คน
        allowNull: false,
      },
      facilities: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING, //รูปห้อง
        allowNull: false,
      },
      hotelId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
    },
    {
      sequelize,
      modelName: "Room",
      timestamps: true,
    }
  );
  return Room;
};
