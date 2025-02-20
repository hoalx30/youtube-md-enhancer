const express = require('express');
// prettier-ignore
const {express: {app}} = require("./client")
// prettier-ignore
const {googleapis: {authorize}} = require("./client")
const { userTaskRouter } = require('./api/router');

const googleapisConfig = async () => await authorize();

const routerConfig = () => {
	app.use('/u-task', userTaskRouter);
};

const middlewareConfig = () => {
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
};

const recoveryConfig = () => {
	app.use((req, res, next) => {
		res.status(404).json({ message: 'Liên kết bạn yêu cầu không tồn tại.' });
	});
	app.use((err, req, res, next) => {
		res.json({ mesage: `Có lỗi khi xử lý yêu cầu: ${err.message}` });
	});
};

module.exports = { googleapisConfig, routerConfig, middlewareConfig, recoveryConfig };
