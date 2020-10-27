const db = require('./db');
const { User, Goal } = require('./models');

async function seed() {
	await db.sync({ force: true });

	const users = await Promise.all([
		User.create({
			firstName: 'Jenny',
			uid: '123456',
			email: 'j@email.com',
		}),
		User.create({
			firstName: 'Lacy',
			email: 'lacy@email.com',
			uid: '654321',
		}),
	]);

	console.log('seeded users');
}

async function runSeed() {
	console.log('seeding...');
	try {
		await seed();
	} catch (err) {
		console.error(err);
		process.exitCode = 1;
	} finally {
		console.log('closing db connection');
		await db.close();
		console.log('db connection closed');
	}
}

if (module === require.main) {
	runSeed();
}

module.exports = seed;
