const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Room, {
        foreignKey: "roomId",
        as: 'roomBooking',
      });
    }
  }
  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
      },
      roomId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.ENUM("Confirm", "Cancel"), //สถานะของการจอง
      paymentStatus: {
        type: DataTypes.ENUM("Pending", "Paid", "Cancel"), // สถานะการชำระเงิน
        defaultValue: "Pending",
      },
      checkOut: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Booking",
      timestamps: true,
    }
  );
  return Booking;
};
