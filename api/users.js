const router = require("express").Router();
const { Goal, User } = require("../db/models");

// signup route, expecting firebase user id and firstName in req.body
router.post("/signup", async (req, res, next) => {
	const { uid, firstName } = req.body;
	const [user] = await User.findOrCreate({
		where: {
			fbId: uid,
			firstName
		}
	});
	console.log(user);
	res.json(user);
});

module.exports = router;
