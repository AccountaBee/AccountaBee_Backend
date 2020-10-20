const router = require("express").Router();
const { User, Post, Friendship } = require("../db/models");
const { Op } = require("sequelize");
const admin = require("../firebase.config");

// create new post route - are we going to be adding in the actual text on the client side, or here?

// expecting { title, completedDays, targetDaysMet, token} in req.body. targetDaysMet is true or false, check on client side if completedDays === requiredDays before creating post

// are we creating a post for each day checked off? if so we should tell the user to go to the feed in the toast notification

router.post("/newPost", async (req, res, next) => {
	try {
		const { token, title, completedDays, targetDaysMet } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		const user = await User.findOne({
			where: {
				uid
			}
		});

		console.log("user in /newPost---->", user);

		const post = await Post.create({ title, completedDays, targetDaysMet });
		console.log("post in /newPost---->", post);
		await user.addPost(post);
		res.json(post);
	} catch (error) {
		next(error);
	}
});

// get all posts that will be displayed on user's feed
// takes in an array of friends and token {friends: [], token: "token"} (can dispatch the get friends action right before this)

router.post("/feed", async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		console.log("uid in /posts --->", uid);

		// find all confirmed friendships related to the current user, can be either senderId or receiverId
		const friendships = await Friendship.findAll({
			where: {
				[Op.or]: [{ senderId: uid }, { receiverId: uid }],
				status: "confirmed"
			}
		});
		console.log("friendships in /posts---->", friendships);

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
		console.log("friendIds in /posts---->", friendIds);

		// find all posts associated with any of the friends - for now this is fine but we need to limit num of posts eventually, maybe some sort of pagination/loading
		const posts = await Post.findAll({
			where: {
				userUid: {
					[Op.or]: friendIds
				}
			}
		});
		res.json(posts);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
