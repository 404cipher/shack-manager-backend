const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const gigsRouter = require("./routes/gigs");
const availabilityRouter = require("./routes/availability");

app.use("/gigs", gigsRouter);
app.use("/availability", availabilityRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

