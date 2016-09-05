/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_) {
	return function view(context, pattern, done) {
		var api = this;
		var handler = api.views.lookup(pattern);
		var callback = done ? done : _.noop;

		if (handler) {
			return handler.call(api, context, pattern, callback);
		}

		return callback();
	};
};
