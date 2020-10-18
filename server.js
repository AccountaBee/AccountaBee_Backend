const express = require("express");
const db = require("./db/db");
const app = express();

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./api"));

app.use((err, req, res, next) => {
	console.error(err);
	console.error(err.stack);
	res.status(err.status || 500).send(err.message || "Internal server error.");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Running on port 8080");
});

db.sync();
