require('dotenv').config();
// prettier-ignore
const { globalContext} = require("./context")
// prettier-ignore
const { express: {established}} = require("./client")
const { googleapisConfig, middlewareConfig, routerConfig, recoveryConfig } = require('./config');

const startServer = async () => {
	const google = await googleapisConfig();
	globalContext.set({ google });
	routerConfig();
	middlewareConfig();
	recoveryConfig();
	established();
};
startServer();
