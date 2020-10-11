const Sequelize = require("sequelize");
const db = require("../db");

const Post = db.define("post", {
	goalTitle: {
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
