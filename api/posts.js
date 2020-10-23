const router = require('express').Router();
const { User, Post, Friendship, Like } = require('../db/models');
const { Op } = require('sequelize');
const admin = require('../firebase.config');

router.post('/newPost', async (req, res, next) => {
	try {
		const { token, title, completedDays, targetDaysMet } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		const user = await User.findOne({
			where: {
				uid
			}
		});

		let post;
		if (req.body.frequency) {
			post = await Post.create({
				title,
				completedDays,
				targetDaysMet,
				frequency: req.body.frequency
			});
		} else {
			post = await Post.create({ title, completedDays, targetDaysMet });
		}

		await user.addPost(post);
		res.json(post);
	} catch (error) {
		next(error);
	}
});

// get all posts that will be displayed on user's feed
// takes in token only

router.post('/feed', async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		// find all confirmed friendships related to the current user, can be either senderId or receiverId
		const friendships = await Friendship.findAll({
			where: {
				[Op.or]: [{ senderId: uid }, { receiverId: uid }],
				status: 'confirmed'
			}
		});

		let friendIds = [];

		// get all of the friend's uids
		for (let i = 0; i < friendships.length; i++) {
			let currentFriendship = friendships[i];
			let friendId;
			// set the friendId to whichever id is opposite to the current user's id
			if (currentFriendship.senderId === uid) friendId = currentFriendship.receiverId;
			else friendId = currentFriendship.senderId;
			friendIds.push(friendId);
		}

		// add in user's uid so their posts are included as well in the feed
		friendIds.push(uid);

		// find all posts associated with any of the friends - for now this is fine but we need to limit num of posts eventually, maybe some sort of pagination/loading
		const posts = await Post.findAll({
			where: {
				userUid: {
					[Op.or]: friendIds
				}
			},
			include: [
				{
					model: Like,
					attributes: ['seen', 'id', 'userUid', 'createdAt']
				},
				{
					model: User
				}
			]
		});
		res.json(posts);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
