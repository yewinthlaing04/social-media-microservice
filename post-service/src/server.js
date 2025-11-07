import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const port = process.env.PORT || 5001;

app.listen(5000, () => {
  console.log(" Server is running a");
});
