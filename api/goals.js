const router = require('express').Router();
const { Goal, User } = require('../db/models');
const admin = require('../firebase.config');

// GET all of a user's goals (for user's dashboard)
// expecting req.body to contain token of current user
router.post('/allGoals', async (req, res, next) => {
	try {
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

		if (!user) {
			const err = new Error('User does not exist');
			return res.status(401).send(err.message);
		} else {
			let goals = user.goals;

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

// DELETE a goal by id (mark as deleted)
router.delete('/:id', async (req, res, next) => {
	try {
		let goal = await Goal.findByPk(req.params.id);
		if (!goal) {
			return res.status(404).send('Goal Does Not Exist');
		}
		await goal.destroy();
		res.send('goal successfully deleted');
	} catch (error) {
		next(error);
	}
});

// POST: create up to 3 new goals
// Expects req.body to be a nested object in format { goals: [{title, frequency}, {title, frequency}, {title, frequency}], token }
router.post('/', async (req, res, next) => {
	try {
		const { goals, token } = req.body;

		const decodedToken = await admin.auth().verifyIdToken(token);
		const uid = decodedToken.uid;

		let user = await User.findOne({
			where: {
				uid
			}
		});

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

		let newGoals = updatedGoals.filter(goal => titles.includes(goal.title));

		// // associate goals with user
		await user.addGoals(newGoals);
		res.json(newGoals);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
