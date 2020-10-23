const router = require('express').Router();
const { Goal, User } = require('../db/models');
const admin = require('../firebase.config');
const multer = require('multer');
const Blob = require('cross-blob');

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

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// route to add a profile picture
router.post('/picture', upload.single('photo'), async (req, res, next) => {
	try {
		console.log('you hit me!');

		console.log('req.body: ', req.body);
		console.log('req.file: ', req.file);

		// const token = req.headers.authorization;
		// console.log('token before! ', token);

		// const decodednpm inToken = await admin.auth().verifyIdToken(token);

		// const uid = decodedToken.uid;

		// console.log('user is: ', user);
		// user.profilePicture = new Blob([req.file.buffer.toString('utf8')], {
		// 	type: req.file.mimetype,
		// });
		// console.log('req.body: ', req.body);
		const [numUpdates, user] = await User.update(
			{
				profilePicture: req.file.buffer,
				mimeType: req.file.mimetype,
			},
			{
				where: {
					firstName: 'Jenny',
				},
				returning: true,
			}
		);

		// user.profilePicture = req.file.buffer.toString('utf-8');
		// console.log('req.file: ', req.file);
		// user.mimeType = req.file.mimetype;
		// await user.save();
		// const jenny = await User.findOne({
		// 	where: {
		// 		firstName: 'Jenny',
		// 	},
		// });
		//
		// let data = {
		// 	image: Buffer.from(jenny.profilePicture, 'utf-8').toString('base64'),
		// 	mimeType: jenny.mimeType,
		// };
		// console.log('user: ', user);
		const image = user[0].profilePicture;
		// console.log('image: ', image);
		res.contentType('image/jpeg');
		res.setHeader('Content-Length', image.length);
		res.send(image);
		// user.profilePicture = new Blob([req.file.buffer.toString('utf8')], {
		// 	type: req.file.mimetype,
		// });
		// res.json(data);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
