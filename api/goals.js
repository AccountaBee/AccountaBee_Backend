const router = require("express").Router();
const { Goal, User } = require("../db/models");

// get all of a user's goals
router.get("/", async (req, res, next) => {
	try {
		const user = await User.findByPk(req.user.id, { include: Goal });
		if (!user) {
			const err = new Error("User is not signed in");
			res.status(401).send(err.message);
		} else {
			// if we request "/goals?active=true" we get only active goals, if active=false only inactive. otherwise, send back all goals
			let goals = user.goals;

			if (req.query.active === "false") goals = goals.filter(goal => !goal.active);
			else if (req.query.active === "true") goals = goals.filter(goal => goal.active);

			res.json(goals);
		}
	} catch (error) {
		next(error);
	}
});

// create new goal on signup. we can redo this to take in all 1-3 goals at once if that's easier on the front end, for for now it adds one goal at a time.
router.post("/signup", async (req, res, next) => {
	try {
		// get current user
		let user = await User.findByPk(req.user.id, { include: Goal });
		let newGoal = await Goal.create({ title: req.body.goal, requiredDays: req.body.frequency });

		// associate goal with user
		await user.addGoal(newGoal);
		// not sure why but when you send out the goal it says the userId is null? weird because it defintely adds it in the database
		res.json(newGoal);
	} catch (error) {
		next(error);
	}
});

// create new goals if user logs in after a week has passed (will check if week has passed on front end before entering this route)
router.post("/weekly", async (req, res, next) => {
	try {
		// get current user
		let user = await User.findByPk(req.user.id, { include: Goal });
		// get current goals
		let goals = await user.getGoals();
		//get active goals only
		activeGoals = goals.filter(goal => goal.active);

		let newGoals = [];

		// update all active goals to inactive, and create new goals with the same information
		for (let i = 0; i < activeGoals.length; i++) {
			let currentGoal = activeGoals[i];
			await currentGoal.update({ active: false });

			let newGoal = await Goal.create({
				title: currentGoal.title,
				requiredDays: currentGoal.requiredDays
			});
			newGoals.push(newGoal);
		}

		await user.addGoals(newGoals);

		res.json(newGoals);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
