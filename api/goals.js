const router = require("express").Router();
const { Goal, User } = require("../db/models");
const admin = require("../firebase.config");

// GET all of a user's goals (for user's dashboard)
// expecting req.body to contain token of current user
router.post("/allGoals", async (req, res, next) => {
	try {
		console.log("IN ACTIVE GOALS ROUTE REQ.BODY:", req.body);
		const { token } = req.body;
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		let user = await User.findOne({
			where: {
				uid
			},
			include: {
				model: Goal
			}
		});
		console.log("IN GET ROUTE USER:", user);

		if (!user) {
			const err = new Error("User does not exist");
			return res.status(401).send(err.message);
		} else {
			// Request "api/goals?active=active" to get only active goals, request active=inactive for only inactive. Otherwise, send back all goals. I think it's better than filtering on client side, but I could be wrong.  Do we need option for deleted goals? Probably not.

			let goals = user.goals;
			// if (req.query.active === "inactive") goals = goals.filter(goal => goal.status === "inactive");
			// else if (req.query.active === "active")
			// 	goals = goals.filter(goal => goal.status === "active");
			console.log("IN GET ROUTE, GOAL:", goals);
			res.json(goals);
		}
	} catch (error) {
		next(error);
	}
});

// GET single goal by id (for single goal page)
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
// expecting a req.body containing uid of current user
router.put("/reset", async (req, res, next) => {
	try {
		const { uid } = req.body;
		// get current user
		let user = await User.findOne({ where: { uid }, attributes: ["uid"] });
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

// // DELETE a goal by id (mark as deleted)
router.delete("/inactivate/:id", async (req, res, next) => {
	try {
		let goal = await Goal.findByPk(req.params.id);
		if (!goal) {
			return res.status(404).send("Goal Does Not Exist");
		}
		goal = await goal.update({ status: "inactive" });
		res.json(goal);
	} catch (error) {
		next(error);
	}
});

// // DELETE a goal by id (mark as deleted)
router.delete("/delete/:id", async (req, res, next) => {
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

// POST: create up to 3 new goals
// Expects req.body to be a nested object in format { goals: [{title, frequency}, {title, frequency}, {title, frequency}], token }
router.post("/", async (req, res, next) => {
	try {
		const { goals, token } = req.body;
		console.log("These are the goals -------> ", goals);
		console.log("This is the token -------> ", token);
		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;
		console.log("This is the decoded uid -------> ", uid);
		let user = await User.findOne({
			where: {
				uid
			}
		});
		console.log("This is the user -------> ", user);
		const updatedGoals = [];
		const titles = [];

		for (let i = 0; i < goals.length; i++) {
			let currentGoal = goals[i];
			let [updatedGoal] = await Goal.findOrCreate({
				where: {
					userUid: uid,
					title: currentGoal.title
				}
			});
			titles.push(currentGoal.title);
			await updatedGoal.update({ frequency: currentGoal.frequency });

			updatedGoals.push(updatedGoal);
		}
		console.log("These are the updated goals -------> ", updatedGoals);
		// let oldGoals = updatedGoals.filter(goal => !titles.includes(goal.title));
		// for (let i = 0; i < oldGoals.length; i++) {
		// 	await oldGoals[i].update({ status: "inactive" });
		// }
		let newGoals = updatedGoals.filter(goal => titles.includes(goal.title));
		console.log("These are the new goals -------> ", newGoals);
		// // associate goals with user
		await user.addGoals(newGoals);
		res.json(newGoals);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
