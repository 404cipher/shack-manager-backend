const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const gigsRouter = require("./routes/gigs");
const availabilityRouter = require("./routes/availability");

app.use("/gigs", gigsRouter);
app.use("/availability", availabilityRouter);

app.listen(3000, () => console.log("Server running on port 3000"));
