const router = require('express').Router();
const { User } = require('../db/models');
const admin = require('../firebase.config');
const multer = require('multer');

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
	} catch (error) {
		next(error);
	}
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

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// route to add a profile picture
router.post('/picture', upload.single('photo'), async (req, res, next) => {
	try {
		const token = req.headers.authorization;

		const decodedToken = await admin.auth().verifyIdToken(token);

		const uid = decodedToken.uid;
		await User.update(
			{
				profilePicture: req.file.buffer,
				mimeType: req.file.mimetype,
			},
			{
				where: {
					uid,
				},
				returning: true,
			}
		);
		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
