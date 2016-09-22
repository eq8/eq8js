/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported() {
	return function addCloseEvent(httpServer) {
		var api = this;

		var closeHttpServer = httpServer.close.bind(httpServer);
		api.on('close', closeHttpServer);
	};
};
