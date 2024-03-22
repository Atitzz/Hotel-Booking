const checkAccessToPage = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.jwt) {
      return res.redirect("/");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = checkAccessToPage;
