/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(router) {
	return function initRoute(req, res, next) {
		var routes = router.recognize(req.url);

		if (routes && routes[0]) {
			req.route = routes[0].handler(routes[0]);
		}

		next();
	};
};
