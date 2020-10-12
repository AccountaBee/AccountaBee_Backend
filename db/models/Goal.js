const Sequelize = require("sequelize");
const db = require("../db");

const Goal = db.define("goal", {
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	requiredDays: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	completedDays: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	}
});

module.exports = Goal;
