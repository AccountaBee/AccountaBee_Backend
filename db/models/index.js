const User = require("./User");
const Goal = require("./Goal");
const Post = require("./Post");
const Friendship = require("./Friendship");

// associations

// senderId == user who sent the request, receiverId = user who receives request
User.belongsToMany(User, {
	as: "friends",
	through: Friendship,
	foreignKey: "senderId",
	otherKey: "receiverId"
});

User.hasMany(Goal);
Goal.belongsTo(User);

User.hasMany(Post);
Post.belongsTo(User);

module.exports = { User, Goal, Post, Friendship };
