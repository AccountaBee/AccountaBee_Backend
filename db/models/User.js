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
		get() {
			const profilePic = this.getDataValue('profilePicture');
			return profilePic
				? URL.createObjectURL(
						`data:
				${this.getDataValue('mimeType')};
				base64,
				${this.getDataValue('profilePicture').toString('base64')}`
				  )
				: null;
		},
	},
	mimeType: {
		type: Sequelize.STRING,
		defaultValue: 'image/png',
	},
});

module.exports = User;
