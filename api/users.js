const router = require("express").Router();
const { Goal, User } = require("../db/models");

// signup route, expecting firebase user id and firstName in req.body
router.post("/signup", async (req, res, next) => {
	const { uid, firstName, email, password } = req.body;
	const [user] = await User.findOrCreate({
		where: {
			uid,
			firstName,
			email,
			password
		}
	});
	console.log(user);
	res.json(user);
});

router.post("/login", async (req, res, next) => {
	try {
		const { uid, email, password } = req.body;
		const user = await User.findByPk(uid, { include: Goal });
		if (!user.correctPassword(password)) {
			console.log("Incorrect password for user:", email);
			res.status(401).send("Wrong username and/or password");
		} else {
			console.log(user);
			res.json(user);
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
