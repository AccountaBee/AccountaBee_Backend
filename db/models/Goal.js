const { INTEGER } = require("sequelize");
const Sequelize = require("sequelize");
const db = require("../db");

// We may need to change this model definition, need to discus how we want goals to work. We could either set up 3 empty goals for each user upon signup, let the user add info for each goal at any time, and automatically reset each goal to zero every week. In this case, we would remove allowNull from fields. We could also create a new goal instance for every single goal the user creates, so that we have a record of everything, but that might be redundant because the Post model will also serve as a record.

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
