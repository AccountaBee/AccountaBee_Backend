const router = require("express").Router();
const { Goal, User } = require("../db/models");
const admin = require("firebase-admin");

const serviceAccount = require(process.env.GCP_KEY_FILE);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.FIREBASE_DATABASE_URL
});

// signup route, expecting token, firstName, and email in req.body
router.post("/signup", async (req, res, next) => {
	const { token, firstName, email } = req.body;
	const decodedToken = await admin.auth().verifyIdToken(token);
	const uid = decodedToken.uid;
	const [user] = await User.findOrCreate({
		where: {
			uid,
			firstName,
			email
		}
	});
	console.log(user);
	res.json(user);
});

// expecting token in req.body

router.post("/login", async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		console.log("DECODED TOKEN", decodedToken);
		const uid = decodedToken.uid;
		console.log("UID", uid);
		const user = await User.findOne({
			where: {
				uid
			},
			include: {
				model: Goal
			}
		});
		res.json(user);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
