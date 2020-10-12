const router = require("express").Router();
const { Goal, User } = require("../db/models");

// TO-DO: security middleware

// GET all of a user's goals (for user's dashboard)
router.get("/", async (req, res, next) => {
	try {
		const user = await User.findByPk(req.user.id, { include: Goal });
		if (!user) {
			const err = new Error("User is not signed in");
			return res.status(401).send(err.message);
		} else {
			// Request "api/goals?active=active" to get only active goals, request active=inactive for only inactive. Otherwise, send back all goals. I think it's better than filtering on client side, but I could be wrong.  Do we need option for deleted goals? Probably not.

			let goals = user.goals;
			if (req.query.active === "inactive") goals = goals.filter(goal => goal.status === "inactive");
			else if (req.query.active === "active")
				goals = goals.filter(goal => goal.status === "active");

			res.json(goals);
		}
	} catch (error) {
		next(error);
	}
});

// GET single goal by id (for single goal page - will contain option to delete goal on page)
router.get("/:id", async (req, res, next) => {
	try {
		const goal = await Goal.findByPk(req.params.id);
		if (!goal) {
			return res.status(404).send("Goal Does Not Exist");
		}
		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// POST: reset all of a user's active goals at a specified time each week (still have to figure out how to reset automatically)
router.put("/reset", async (req, res, next) => {
	try {
		// get current user
		let user = await User.findByPk(req.user.id, { include: Goal });
		// get current goals
		let goals = await user.getGoals();
		//get active goals only
		activeGoals = goals.filter(goal => goal.status === "active");

		// reset completedDays to zero
		for (let i = 0; i < activeGoals.length; i++) {
			await activeGoals[i].update({ completedDays: 0 });
		}
		console.log(activeGoals);
		res.json(activeGoals);
	} catch (error) {
		next(error);
	}
});

// PUT: add 1 day to completedDays of a single goal. User will see a checkbox for this.
router.put("/:id", async (req, res, next) => {
	try {
		let goal = await Goal.findByPk(req.params.id);

		if (goal.completedDays === 7) {
			return res.send("Can not complete goal more than 7 days in a week");
		}

		goal = await goal.update({ completedDays: goal.completedDays + 1 });

		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// DELETE a goal by id (mark as deleted)
router.delete("/:id", async (req, res, next) => {
	try {
		let goal = await Goal.findByPk(req.params.id);
		if (!goal) {
			return res.status(404).send("Goal Does Not Exist");
		}
		goal = await goal.update({ status: "deleted" });
		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// POST: create up to 3 new goals on signup
// Expects req.body to be a nested object in format { goal1: { title: "title", requiredDays: 4 }, goal2: { title: "title", requiredDays: 3} }
router.post("/signup", async (req, res, next) => {
	try {
		// get current user
		let user = await User.findByPk(req.user.id);

		const goals = req.body;
		const goalsArr = [];

		// create a new goal for each goal in req.body
		for (let goal in goals) {
			let title = goals[goal].title;
			let requiredDays = goals[goal].requiredDays;
			let newGoal = await Goal.create({ title, requiredDays });
			goalsArr.push(newGoal);
		}
		// associate goals with user
		await user.addGoals(goalsArr);

		res.json(goalsArr);
	} catch (error) {
		next(error);
	}
});

// Add a single new goal. expecting req.body to be in format { title: "title", requiredDays: 6}
// User should not see an option to add new goal unless they have less than 3 active goals, but we have error handling just in case
router.post("/", async (req, res, next) => {
	const goal = await Goal.create(req.body);
	const user = await User.findByPk(req.user.id, { include: Goal });
	let activeGoals = user.goals.filter(goal => goal.status === "active");
	if (activeGoals.length >= 3) {
		return res.status(500).send("Can only have 3 current goals");
	}

	user.addGoal(goal);
	res.json(goal);
});

module.exports = router;
