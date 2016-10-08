/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api) {
	return function initRoute(ws, done) {
		var routes = api.router.recognize(ws.upgradeReq.url);

		if (routes && routes[0]) {
			ws.route = routes[0].handler(routes[0]);
		}

		done();
	};
};
