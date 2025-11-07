import logger from "../utils/logger.js";
import User from "../models/User.js";
import { validateRegistartion } from "../utils/validators.js";
import generateToken from "../utils/generateToken.js";

// user registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    const { error } = validateRegistartion(req.body);
    // if error , return validation error logger
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User already exist");
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    user = new User({ username, email, password });
    await user.save();

    logger.info("User saved successfully", user._id);

    const { refreshToken, accessToken } = await generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User is created successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error("User registration server", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// user login

// refresh token

// logout

export { registerUser };
