const jwt = require("jsonwebtoken");
const { createError } = require("../error");

const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return next(createError(401, "You are not authenticated!"));
  const realtoken = token.split(" ")[1];
  jwt.verify(realtoken, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};

module.exports = { verifyToken };
