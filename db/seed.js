const db = require("./db");
const { User, Goal } = require("./models");

async function seed() {
	await db.sync({ force: true });

	const users = await Promise.all([
		User.create({
			firstName: "Jenny",
			uid: "123456",
			email: "J@email.com",
			password: "123456"
		})
		// User.create({
		// 	firstName: "Lacy",
		// 	email: "Lacy0090@email.com",
		// 	password: "helloWorld"
		// }),
		// User.create({
		// 	firstName: "Carry",
		// 	email: "CarryLim@email.com",
		// 	password: "TimeLess12294"
		// }),
		// User.create({
		// 	firstName: "Connie",
		// 	email: "CGordan@email.com",
		// 	password: "crAshing567"
		// }),
		// User.create({
		// 	firstName: "Edward",
		// 	email: "EGisCool@email.com",
		// 	password: "Ell9090"
		// }),
		// User.create({
		// 	firstName: "Sam",
		// 	email: "ChanchanisHere@email.com",
		// 	password: "8979goodBye"
		// })
	]);

	// right now, this is our solution when adding friends to make the friendship go both ways. Not sure if it's better to have double the amount of fields in te database, or to make querying more complicated later on.
	// await users[0].addFriend(users[1]);
	// await users[1].addFriend(users[0]);

	console.log("seeded users");
}

async function runSeed() {
	console.log("seeding...");
	try {
		await seed();
	} catch (err) {
		console.error(err);
		process.exitCode = 1;
	} finally {
		console.log("closing db connection");
		await db.close();
		console.log("db connection closed");
	}
}

if (module === require.main) {
	runSeed();
}

module.exports = seed;
