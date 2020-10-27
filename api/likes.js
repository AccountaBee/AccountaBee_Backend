const router = require('express').Router();
const { User, Like, Post } = require('../db/models');
const admin = require('../firebase.config');

// add a like to a post, takes in token and post id
router.post('/add', async (req, res, next) => {
	try {
		const { token, postId } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		const like = await Like.findOne({
			where: {
				postId,
				userUid: uid,
			},
		});

		// makes sure user doesn't like post twice, even though they shouldn't be able to access this route if they've already liked it
		if (like) {
			return res.send(like);
		}

		const user = await User.findOne({
			where: {
				uid,
			},
		});
		const newLike = await Like.create();
		await user.addLike(newLike);
		const post = await Post.findByPk(postId);
		await post.addLike(newLike);
		const updatedLike = await Like.findByPk(newLike.id);
		res.json(updatedLike);
	} catch (error) {
		next(error);
	}
});

// remove like from post. Expecting token and post id in body
router.post('/remove', async (req, res, next) => {
	try {
		const { token, postId } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		const like = await Like.findOne({
			where: {
				postId,
				userUid: uid,
			},
		});

		const deletedLike = { postId, userUid: like.userUid, id: like.id };

		await like.destroy();
		res.send(deletedLike);
	} catch (error) {
		next(error);
	}
});

// show all of a user's unseen likes (this will display on modal on feed)
router.post('/unseen', async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		// find all posts where userUid = uid, include unseen likes
		const posts = await Post.findAll({
			where: {
				userUid: uid,
			},
			attributes: ['id', 'title', 'completedDays'],
			include: {
				model: Like,
				where: {
					seen: false,
				},
				attributes: ['id', 'userUid'],
				include: {
					model: User,
					attributes: ['firstName'],
				},
			},
		});
		res.json(posts);
	} catch (error) {
		next(error);
	}
});

// changes all unseen likes to seen when user closes out the modal
// expecting { likes: [{}, {}], token }
router.put('/update', async (req, res, next) => {
	try {
		const { token, likes } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		for (let i = 0; i < likes.length; i++) {
			let like = await Like.findByPk(likes[i].id);
			await like.update({ seen: true });
		}
		res.send('Sucessfully closed out notifications');
	} catch (error) {
		next(error);
	}
});

module.exports = router;
