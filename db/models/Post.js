const Sequelize = require("sequelize");
const db = require("../db");

// Posts will serve as a record of completed goals. A new post will be created each time a user completes a day of their goal. The targetDaysMet field will be true if the user has completed all the days of their goal.

const Post = db.define("post", {
	title: {
		type: Sequelize.STRING,
		allowNull: false
	},
	completedDays: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	targetDaysMet: {
		type: Sequelize.BOOLEAN,
		allowNull: false
	}
});

module.exports = Post;
