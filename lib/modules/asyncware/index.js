/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

function exported(_, async) {
	var instance = {
		tasks: [],
	};

	var app = function asyncware(ws) { // eslint-disable-line func-style
		async.applyEachSeries(instance.tasks, ws, _.noop);
	};

	app.use = use.bind(instance);

	return app;
}

function use(task) {
	var instance = this;

	instance.tasks.push(task);
}

module.exports = exported;
