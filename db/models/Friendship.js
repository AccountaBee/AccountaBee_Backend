const Sequelize = require("sequelize");
const db = require("./db");

const Friend = db.define("friendship", {
	status: {
		type: Sequelize.ENUM("requested", "confirmed", "denied"),
		allowNull: false,
		defaultValue: "requested"
	}
});

module.exports = Friend;
