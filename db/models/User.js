const Sequelize = require('sequelize');
const db = require('../db');

const User = db.define('user', {
	firstName: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	uid: {
		type: Sequelize.STRING,
		primaryKey: true,
	},
	email: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			isEmail: true,
		},
	},
	profilePicture: {
		type: Sequelize.BLOB('tiny'),
	},
	mimeType: {
		type: Sequelize.STRING,
		// defaultValue: 'image/jpeg',
	},
});

module.exports = User;
