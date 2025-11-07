import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoutes.js";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import helmet from "helmet";
import cors from "cors";
import redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { RedisStore } from "rate-limit-redis";
import errorHandler from "./middleware/errorhandler.js";

// for .env file
dotenv.config();

const app = express();
const port = process.env.PORT;
// connection mongo db
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("Connected to mongo db "))
  .catch((e) => logger.error("Mongo DB connection error", e));

// redis client
const redistClient = redis.createClient(process.env.REDIS_URL);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// ddos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redistClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceed for IP : ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many request" });
    });
});

// ip based rate limiting for sensitive endpoints
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceed for IP : ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redistClient.call(...args),
  }),
});

// apply this sensitiveendpoint rate limiter to route
app.use("/api/auth/register", sensitiveEndpointLimiter);

app.use("/api/auth", userRoute);

// error handler
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Identity service running on port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason: ", reason);
});
