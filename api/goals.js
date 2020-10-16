const router = require('express').Router();
const { Goal, User } = require('../db/models');
const admin = require('firebase-admin');

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// TO-DO: security middleware - will need to check if the current uid we pass to req.body matches the uid of user or the userId of a goal

// GET all of a user's goals (for user's dashboard)
// expecting req.body to contain uid of current user
router.get('/', async (req, res, next) => {
	try {
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		let user = await User.findOne({
			where: {
				uid,
			},
			include: {
				model: Goals,
			},
		});
		if (!user) {
			const err = new Error('User does not exist');
			return res.status(401).send(err.message);
		} else {
			// Request "api/goals?active=active" to get only active goals, request active=inactive for only inactive. Otherwise, send back all goals. I think it's better than filtering on client side, but I could be wrong.  Do we need option for deleted goals? Probably not.

			let goals = user.goals;
			// if (req.query.active === "inactive") goals = goals.filter(goal => goal.status === "inactive");
			// else if (req.query.active === "active")
			// 	goals = goals.filter(goal => goal.status === "active");

			res.json(goals);
		}
	} catch (error) {
		next(error);
	}
});

// GET single goal by id (for single goal page)
router.get('/:id', async (req, res, next) => {
	try {
		const goal = await Goal.findByPk(req.params.id);
		if (!goal) {
			return res.status(404).send('Goal Does Not Exist');
		}
		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// POST: reset all of a user's active goals at a specified time each week (still have to figure out how to reset automatically)
// expecting a req.body containing uid of current user
router.put('/reset', async (req, res, next) => {
	try {
		const { uid } = req.body;
		// get current user
		let user = await User.findOne({ where: { uid }, attributes: ['uid'] });
		// get current goals

		let goals = await user.getGoals();

		// reset completedDays to zero
		for (let i = 0; i < goals.length; i++) {
			await goals[i].update({ completedDays: 0 });
		}

		res.json(goals);
	} catch (error) {
		next(error);
	}
});

// PUT: add 1 day to completedDays of a single goal. User will see a checkbox for this.
router.put('/:id', async (req, res, next) => {
	try {
		let goal = await Goal.findByPk(req.params.id);

		if (goal.completedDays === 7) {
			return res.send('Can not complete goal more than 7 days in a week');
		}

		goal = await goal.update({ completedDays: goal.completedDays + 1 });

		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// // DELETE a goal by id (mark as deleted)
// router.delete("/:id", async (req, res, next) => {
// 	try {
// 		let goal = await Goal.findByPk(req.params.id);
// 		if (!goal) {
// 			return res.status(404).send("Goal Does Not Exist");
// 		}
// 		goal = await goal.update({ status: "deleted" });
// 		res.json(goal);
// 	} catch (error) {
// 		next(error);
// 	}
// });

// POST: create up to 3 new goals
// Expects req.body to be a nested object in format { goals: [{title, frequency}, {title, frequency}, {title, frequency}], token }
router.post('/', async (req, res, next) => {
	try {
		const { goals, token } = req.body;

		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		let user = await User.findOne({
			where: {
				uid,
			},
		});

		const updatedGoals = [];
		const titles = [];

		for (let i = 0; i < goals.length; i++) {
			let currentGoal = goals[i];
			let [updatedGoal] = Goal.findOrCreate({
				where: {
					uid,
					title: currentGoal.title,
				},
			});
			titles.push(currentGoal.title);
			await updatedGoal.update({ frequency: currentGoal.frequency });

			updatedGoals.push(updatedGoal);
		}

		let oldGoals = updatedGoals.filter((goal) => !titles.includes(goal.title));
		for (let i = 0; i < oldGoals.length; i++) {
			await oldGoals[i].update({ status: 'inactive' });
		}
		let newGoals = updatedGoals.filter((goal) => titles.includes(goal.title));
		// // associate goals with user
		await user.addGoals(newGoals);
		res.json(newGoals);
	} catch (error) {
		next(error);
	}
});

// Add a single new goal. expecting req.body to be in format { title: "title", requiredDays: 6, uid: firebaseId}
// User should not see an option to add new goal unless they have less than 3 active goals, but we have error handling just in case

// router.post("/", async (req, res, next) => {
// 	const goal = await Goal.create(req.body);
// 	const user = await User.findByPk(req.user.id, { include: Goal });
// 	let activeGoals = user.goals.filter(goal => goal.status === "active");
// 	if (activeGoals.length >= 3) {
// 		return res.status(500).send("Can only have 3 current goals");
// 	}

// 	user.addGoal(goal);
// 	res.json(goal);
// });

module.exports = router;
