const userRouter = require("./user.js");
const roomRouter = require("./room.js");
// const managementRouter = require("./management.js");

const route = (app) => {
  app.use("*", function(req, res, next) {
    res.locals.user = req.user || null;
    next();
  });
  app.use("/", roomRouter);
  app.use("/users", userRouter);
  // app.use("/management", managementRouter);
};

module.exports = route;
