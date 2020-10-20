const router = require("express").Router();
const { User, Like, Post } = require("../db/models");
const admin = require("../firebase.config");

// route to show all of a user's unseen likes (this will display on modal on feed)

router.post("/unseen", async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		console.log("decoded token: ", uid);

		// find all posts where userUid = uid, include unseen likes
		const posts = await Post.findAll({
			where: {
				userUid: uid
			},
			attributes: ["id", "title", "completedDays"],
			include: {
				model: Like,
				where: {
					seen: false
				},
				include: {
					model: User,
					attributes: ["firstName"]
				}
			}
		});
		// should have an array of posts, each with an array of unseen likes
		// can use post info to craft notification structure ("firstName", "firstName", and 3 others congratulated you for completing "completedDays" days of "title")
		res.json(posts);
	} catch (error) {
		next(error);
	}
});

// changes all unseen likes to seen when user closes out the modal

// concat likes into one array on client side before passing in
// takes in { likes: [{}, {}], token }

router.put("/update", async (req, res, next) => {
	try {
		const { token, likes } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		console.log("decoded token: ", uid);

		for (let i = 0; i < likes.length; i++) {
			let like = likes[i];
			await like.update({ seen: true });
		}
		res.send("Sucessfully closed out notifications");
	} catch (error) {
		next(error);
	}
});

module.exports = router;
