const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    static associate(models) {
      Hotel.hasMany(models.Room, {
        foreignKey: "hotelId",
        as: 'rooms',
      });
    }
  }
  Hotel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Hotel",
      timestamps: true,
    }
  );
  return Hotel;
};
