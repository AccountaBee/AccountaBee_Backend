const express = require("express");
const db = require("./db/db");
const app = express();
const { User } = require("./db/models");
const session = require('express-session')
const passport = require('passport')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const sessionStore = new SequelizeStore({db})

sessionStore.sync()

// passport registration
passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findByPk(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// body parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// session middleware with passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my best friend is Cody',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get("/", async (req, res, next) => {
	let users = await User.findAll();
	res.json(users);
});

// app.get("/api", (req, res, next) => {
// 	res.json({ testKey: "testValue" });
// });

app.use('/auth', require('./auth'))
//app.use('/api', require('./api'))

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Running on port 8080");
});

db.sync();
