const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Booking.belongsTo(models.Room, {
        foreignKey: "roomId",
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
      userId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      roomId: {
        type: DataTypes.INTEGER,
        foreignKey: true,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.ENUM("Confirm", "Cancel"), //สถานะของการจอง
      paymentStatus: {
        type: DataTypes.ENUM("Pending", "Paid"), // สถานะการชำระเงิน
        defaultValue: "Pending",
      },
    },
    {
      sequelize,
      modelName: "Booking",
      timestamps: false,
    }
  );
  return Booking;
};
