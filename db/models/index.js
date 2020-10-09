const User = require("./User");
const Goal = require("./Goal");

//create associations here

User.belongsToMany(User, {
	as: "friends",
	through: "friendship",
	foreignKey: "userId",
	otherKey: "friendId"
});

//add more models when we make them
module.exports = { User, Goal };
