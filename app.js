const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const masterRoutes = require("./routes/masterRoutes");
const watchListRoutes = require("./routes/watchListRoutes");
const jobRoutes = require("./routes/jobRoutes");
const orderRoutes = require("./routes/orderRoutes");
const constants = require("./config/constants");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
global.constants = constants;

app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/user", userRoute);
app.use("/master", masterRoutes);
app.use("/watch_list", watchListRoutes);
app.use("/jobs", jobRoutes);
app.use("/order", orderRoutes);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
