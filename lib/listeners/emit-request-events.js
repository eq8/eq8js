/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported() {
	return function emitRequestEvents(httpServer) {
		var api = this;

		var emitRequestEvent = api.emit.bind(api, 'request');

		httpServer.on('request', emitRequestEvent);
	};
};
