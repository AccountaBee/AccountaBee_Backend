const router = require("express").Router();

router.use("/goals", require("./goals"));
router.use("/posts", require("./posts"));
router.use("/users", require("./users"));
router.use("/friends", require("./friends"));
router.use("/likes", require("./likes"));

router.use((req, res, next) => {
	const error = new Error("Not Found");
	error.status = 404;
	next(error);
});

module.exports = router;
