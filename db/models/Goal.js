const Sequelize = require("sequelize");
const db = require("../db");

const Goal = db.define("goal", {
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	frequency: {
		type: Sequelize.INTEGER
	},
	completedDays: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	status: {
		type: Sequelize.ENUM("active", "inactive", "deleted"),
		defaultValue: "active"
	}
});

module.exports = Goal;
