const router = require("express").Router();
const { User, Friendship } = require("../db/models/index");
const { Op } = require("sequelize");

module.exports = router;

// TO-DO - change all uid to tokens, change names of table to be more clear

// get all confirmed friends
router.get("/", async (req, res, next) => {
	try {
		const { uid } = req.body;
		const friendships = await Friendship.findAll({
			where: {
				[Op.or]: [{ userId: uid }, { friendId: uid }],
				status: "confirmed"
			}
		});
		const friends = [];
		// push users who are NOT the current user into friends
		for (let i = 0; i < friendships.length; i++) {
			let current = friendships[i];
			let friendId;
			if (current.userId === uid) friendId = current.friendId;
			else friendId = current.userId;
			let friend = await User.findOne({
				where: {
					uid: friendId
				}
			});
			friends.push(friend);
		}
		res.json(friends);
	} catch (error) {
		next(error);
	}
});

// SEND friend request - create new relationship with status "requested", current user being uid1
// expecting token and friend email in req.body
router.post("/request", async (req, res, next) => {
	try {
		const { uid, email } = req.body;
		const friend = await User.findOne({
			where: {
				email
			}
		});

		const user = await User.findOne({
			where: {
				uid
			}
		});
		console.log(user, friend);

		if (!friend || !user) {
			return res.status(404).send("Sorry, that user does not have an account");
		}
		await user.addFriend(friend);
		res.send(`Your friend request to ${friend.firstName} is sent!`);
	} catch (error) {
		next(error);
	}
});

// route to view all requests sent to you, expecting token and friend uid
router.get("/invites", async (req, res, next) => {
	// findAll where my uid is friendId
	const { uid, senderId } = req.body;
	const invites = await Friendship.findAll({
		where: {
			userId: senderId,
			friendId: uid,
			status: "requested"
		}
	});

	// loop through each request to get email and firstName to display to user
	const inviteObjs = [];
	for (let i = 0; i < invites.length; i++) {
		let friend = await User.findOne({
			where: {
				uid: senderId
			},
			attributes: ["firstName", "email", "uid"]
		});
		inviteObjs.push(friend);
	}
	res.json(inviteObjs);
});

// route to confirm friendship - takes in user token and requester's id and status (either confirmed or denied)
router.put("/reply", async (req, res, next) => {
	try {
		// change status to confirmed or denied
		const { uid, senderId, status } = req.body;
		const friendship = await Friendship.findOne({
			where: {
				userId: senderId,
				friendId: uid
			}
		});
		await friendship.update({ status });
		res.send(`You are now friends!`);
	} catch (error) {
		next(error);
	}
});

// route to get all requests you've sent, takes in token
router.get("/sent", async (req, res, next) => {
	try {
		const { uid } = req.body;
		const user = await User.findOne({
			where: {
				uid
			}
		});
		// can only use magic methods on SENDER

		const friendships = await user.getFriends();
		const unconfirmed = friendships.filter(
			friendship => friendship.friendship.status === "requested"
		);
		res.json(unconfirmed);
	} catch (error) {
		next(error);
	}
});
