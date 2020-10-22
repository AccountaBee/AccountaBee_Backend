const router = require('express').Router();
const { Goal, User } = require('../db/models');
const admin = require('../firebase.config');

router.post('/', async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
	} catch (error) {
		next(error);
	}
});

// signup route, expecting token, firstName, and email in req.body
router.post('/signup', async (req, res, next) => {
	try {
		const { token, firstName, email } = req.body;

		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		const [user] = await User.findOrCreate({
			where: {
				uid,
				firstName,
				email,
			},
		});

		res.json(user);
	} catch (error) {}
});

// expecting token in req.body

router.post('/login', async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);

		const uid = decodedToken.uid;

		const user = await User.findOne({
			where: {
				uid,
			},
		});
		res.json(user);
	} catch (error) {
		next(error);
	}
});

// route to add a profile picture
router.put('/picture', async (req, res, next) => {
	try {
		const token = req.headers.authorization;
		console.log('token before! ', token);
		const decodedToken = await admin.auth().verifyIdToken(token);
		console.log('token! ', token);
		const uid = decodedToken.uid;

		const user = await User.findOne({
			where: {
				uid,
			},
		});
		console.log('user is: ', user);
		console.log('req.header: ', req.headers);
		console.log('req.body: ', req.body);
		// user.profilePicture
		// // await user.save();
		// res.json(user);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
