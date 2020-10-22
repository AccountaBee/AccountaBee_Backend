const router = require('express').Router();
const { User, Friendship } = require('../db/models/index');
const { Op } = require('sequelize');
const admin = require('../firebase.config');

// GET all of the user's friends (all friends who's status is "confirmed")
// expecting token in req.body
router.post('/', async (req, res, next) => {
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

		const friends = [];
		// push all users from friendships who are NOT the current user into friends array so that we can send back info about each friend
		for (let i = 0; i < friendships.length; i++) {
			let currentFriendship = friendships[i];
			let friendId;
			// set the friendId to whichever id is opposite to the current user's id
			if (currentFriendship.senderId === uid) friendId = currentFriendship.receiverId;
			else friendId = currentFriendship.senderId;
			// find friend in the database
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

router.post('/number', async (req, res, next) => {
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

		res.json(friendships.length);
	} catch (error) {
		next(error);
	}
});

// POST: send friend request. Create new row in Friendship with status "requested", current user id is set to senderId and friend's id is set to receiverId
// expecting current user token and friend's email in req.body
router.post('/request', async (req, res, next) => {
	try {
		const { token, email } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

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

		if (!friend || !user) {
			return res.status(404).send('Sorry, that user does not have an account');
		}

		// creates row with user id as senderId and friend's id as receiverId
		await user.addFriend(friend);

		res.send(`Your friend request to ${friend.firstName} is sent!`);
	} catch (error) {
		next(error);
	}
});

// GET /sent - route to get all requests you've sent, takes in token
router.post('/sent', async (req, res, next) => {
	try {
		const { token } = req.body;

		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		const user = await User.findOne({
			where: {
				uid
			}
		});

		// can only use magic methods on SENDER
		const friendships = await user.getFriends();

		// filter so we only have friendships with requested status
		const unconfirmed = friendships.filter(
			friendship => friendship.friendship.status === 'requested'
		);
		res.json(unconfirmed);
	} catch (error) {
		next(error);
	}
});

// GET /invites - get all friend requests sent to you. expecting token of current user
router.post('/invites', async (req, res, next) => {
	try {
		const { token } = req.body;

		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		// find all friendships where user is the reciever and status is "requested"
		const requests = await Friendship.findAll({
			where: {
				receiverId: uid,
				status: 'requested'
			}
		});

		// loop through each friendship so we have access to email and firstName of friend to display to user
		const requestedFriends = [];
		for (let i = 0; i < requests.length; i++) {
			let friend = await User.findOne({
				where: {
					uid: requests[i].senderId
				},
				attributes: ['firstName', 'email', 'uid']
			});
			requestedFriends.push(friend);
		}
		res.json(requestedFriends);
	} catch (error) {
		next(error);
	}
});

// PUT /reply - route to confirm or deny friendship. takes in current user token, sender's id, and status (either confirmed or denied) in req.body
router.put('/reply', async (req, res, next) => {
	try {
		const { token, senderId, status } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		const friendship = await Friendship.findOne({
			where: {
				senderId,
				receiverId: uid
			}
		});

		await friendship.update({ status });
		if (status === 'confirmed') return res.send(`You are now friends!`);
		else if (status === 'denied') return res.send('Successfully deleted friend request');
		else {
			return res.status(500).send('Sorry, there was an error');
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
