const router = require("express").Router();
const { Goal, User } = require("../db/models");

// GET all of a user's goals
router.get("/", async (req, res, next) => {
	try {
		const user = await User.findByPk(req.user.id, { include: Goal });
		if (!user) {
			const err = new Error("User is not signed in");
			return res.status(401).send(err.message);
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

// PUT: update a single goal by id. Can use this route for updating goal title/days, or to mark a day as completed, in which case use query params "/:id?complete=true". These actions should occur seperately (can not update day and body at the same time)

// expecting a req.body in the form {goal: "goal title", frequency: 3}

// I'm matching key names to the current front end, but we can always change them later to match the database field names to keep things more clear/dry. Or we can change the database field names!

// router.put("/:id", async (req, res, next) => {
// 	try {
// 		let goal = await Goal.findByPk(req.params.id);
// 		if (!goal) {
// 			const err = new Error("Sorry, that goal could not be found");
// 			return res.status(404).send(err.message);
// 		}
// 		let updateBody = {};
// 		if (req.query.complete === "true") {
// 			// should we let the user add more days than required? I think so. In which case, let's just double check to make sure we don't accidentally add more than 7 days. We should have front-end logic to make that button unavailable.
// 			if (goal.completedDays === 7) {
// 				const err = new Error("There are only 7 days in a week, can't add more!");
// 				// no idea what status codes to use.....
// 				return res.status(500).send(err.message);
// 			}
// 			updateBody = { completedDays: goal.completedDays + 1 };
// 		} else if (req.body) {
// 			updateBody = { title: req.body.goal, requiredDays: req.body.frequency };
// 		} else {
// 			// if we don't have a query param or a req.body, something went wrong on our end
// 			const err = new Error("Internal Server Error");
// 			return res.status(500).send(err.message);
// 		}

// 		goal = await goal.update(updateBody);

// 		res.json(goal);
// 	} catch (error) {
// 		next(error);
// 	}
// });

// POST: create new goals on signup
// Expects req.body to be a nested object structured like { goal1: { title: "title", requiredDays: 4 }, goal2: { title: "title", requiredDays: 3} }
router.post("/signup", async (req, res, next) => {
	try {
		// get current user
		let user = await User.findByPk(req.user.id);
		console.log(req.body);
		const goals = req.body;
		const goalsArr = [];
		for (let goal in goals) {
			let title = goals[goal].title;
			let requiredDays = goals[goal].requiredDays;
			let newGoal = await Goal.create({ title, requiredDays });
			goalsArr.push(newGoal);
		}
		// // associate goals with user
		await user.addGoals(goalsArr);

		res.json(goalsArr);
	} catch (error) {
		next(error);
	}
});

// POST: create new goals if user logs in after a week has passed (will check if week has passed on front end before entering this route)
// router.post("/weekly", async (req, res, next) => {
// 	try {
// 		// get current user
// 		let user = await User.findByPk(req.user.id, { include: Goal });
// 		// get current goals
// 		let goals = await user.getGoals();
// 		//get active goals only
// 		activeGoals = goals.filter(goal => goal.active);

// 		let newGoals = [];

// 		// update all active goals to inactive, and create new goals with the same information
// 		for (let i = 0; i < activeGoals.length; i++) {
// 			let currentGoal = activeGoals[i];
// 			await currentGoal.update({ active: false });

// 			let newGoal = await Goal.create({
// 				title: currentGoal.title,
// 				requiredDays: currentGoal.requiredDays
// 			});
// 			newGoals.push(newGoal);
// 		}

// 		await user.addGoals(newGoals);

// 		res.json(newGoals);
// 	} catch (error) {
// 		next(error);
// 	}
// });

module.exports = router;
