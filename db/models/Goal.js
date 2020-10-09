const Sequelize = require("sequelize");
const db = require("../db");

const Goal = db.define("goal", {
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	requiredDays: {
		type: Sequelize.INTEGER
	},
	completedDays: {
		type: Sequelize.INTEGER
	}
});

module.exports = Goal;
