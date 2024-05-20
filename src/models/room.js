const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.hasOne(models.Booking, {
        foreignKey: "roomId",
        as: 'roomBooking'
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
          "Standard",
          "Superior",
          "Deluxe",
          "Suite"
        ), 
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("Available", "Occupied"), 
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      facilities: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.TEXT, 
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Room",
      timestamps: true
    }
  );
  return Room;
};
