const db = require("./db");
const { User, Goal } = require("./models");

async function seed() {
	await db.sync({ force: true });

	const users = await Promise.all([
		User.create({
			firstName: "Jenny",
			lastName: "Thomas",
			email: "JThomas@email.com",
			password: "12567"
		}),
		User.create({
			firstName: "Ben",
			lastName: "Murphy",
			email: "Bmurphy@email.com",
			password: "wishesRus"
		}),
		User.create({
			firstName: "Lacy",
			lastName: "Mitchell",
			email: "Lacy0090@email.com",
			password: "helloWorld"
		}),
		User.create({
			firstName: "Carry",
			lastName: "Benson",
			email: "CarryLim@email.com",
			password: "TimeLess12294"
		}),
		User.create({
			firstName: "Connie",
			lastName: "Gordan",
			email: "CGordan@email.com",
			password: "crAshing567"
		}),
		User.create({
			firstName: "Edward",
			lastName: "Gonzalez",
			email: "EGisCool@email.com",
			password: "Ell9090"
		}),
		User.create({
			firstName: "Sam",
			lastName: "chan",
			email: "ChanchanisHere@email.com",
			password: "8979goodBye"
		})
	]);

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
