const Sequelize = require('sequelize');
const db = require('../db');

const Like = db.define('like', {
	seen: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
});

module.exports = Like;
