const User = require("./User");
const Goal = require("./Goal");
const Post = require("./Post");

//create associations here

User.belongsToMany(User, {
	as: "friends",
	through: "friendship",
	foreignKey: "userId",
	otherKey: "friendId"
});

User.hasMany(Goal);
Goal.belongsTo(User);

User.hasMany(Post);
Post.belongsTo(User);

//add more models when we make them
module.exports = { User, Goal };
