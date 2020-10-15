const fs = require("fs");
fs.writeFile("./google-credentials-heroku.json", process.env.GCP_CRED, err => {});
