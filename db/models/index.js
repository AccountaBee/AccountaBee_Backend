const User = require('./User');
const Goal = require('./Goal');
const Post = require('./Post');
const Friendship = require('./Friendship');
const Like = require('./Like');

// associations

// senderId == user who sent the request, receiverId = user who receives request
User.belongsToMany(User, {
	as: 'friends',
	through: Friendship,
	foreignKey: 'senderId',
	otherKey: 'receiverId',
});

User.hasMany(Goal);
Goal.belongsTo(User);

User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Like);
Like.belongsTo(Post);

User.hasMany(Like);
Like.belongsTo(User);

module.exports = { User, Goal, Post, Friendship, Like };
