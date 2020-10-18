const Sequelize = require("sequelize");
const db = require("../db");

const Friendship = db.define("friendship", {
	status: {
		type: Sequelize.ENUM("requested", "confirmed", "denied"),
		allowNull: false,
		defaultValue: "requested"
	}
});

module.exports = Friendship;
