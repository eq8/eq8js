/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_) {
	return function view(pattern, context, done) {
		var api = this;
		var handler = api.views.lookup(pattern);
		var callback = done ? done : _.noop;

		if (handler) {
			return handler.call(api, pattern, context, callback);
		}

		return callback();
	};
};
