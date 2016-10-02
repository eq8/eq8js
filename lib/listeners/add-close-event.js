/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api) {
	return function addCloseEvent(httpServer) {
		var closeHttpServer = httpServer.close.bind(httpServer);

		api.on('close', closeHttpServer);
	};
};
