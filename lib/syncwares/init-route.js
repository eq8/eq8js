/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api) {
	return function initRoute(req, res, next) {
		var routes = api.router.recognize(req.url);

		if (routes[0]) {
			req.route = routes[0].handler(routes[0]);
		}

		next();
	};
};
