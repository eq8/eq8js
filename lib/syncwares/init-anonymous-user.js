/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api) {
	return function initAnonymousUser(req, res, next) {
		if (!req.user) {
			req.user = api.options.users.anon;
		}

		next();
	};
};
