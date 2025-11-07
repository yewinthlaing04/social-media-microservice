import jwt from "jsonwebtoken";
import crypto from "crypto";
import Token from "../models/Token.js";

const generateToken = async (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT SECRET environment variable");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 7); // refresh token expires in 7 days

  // create token
  await Token.create({
    token: refreshToken,
    user: user._id,
    expiredAt,
  });

  return { refreshToken, accessToken };
};

export default generateToken;
