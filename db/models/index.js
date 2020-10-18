const User = require("./User");
const Goal = require("./Goal");
const Post = require("./Post");
const Friend = require("./Friend");

//create associations here

User.belongsToMany(User, {
	as: "friends",
	through: Friend,
	foreignKey: "userId",
	otherKey: "friendId"
});

User.hasMany(Goal);
Goal.belongsTo(User);

User.hasMany(Post);
Post.belongsTo(User);

module.exports = { User, Goal, Post, Friend };
