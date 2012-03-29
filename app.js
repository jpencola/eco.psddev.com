var config = require('./config.js');

// Setup Express Configs
require("./libs/express.js").init(config);

// Startup Server Configs
require("./libs/server.js")(config);
