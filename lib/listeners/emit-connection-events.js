/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, WebSocketServer) {
	return function emitConnectionEvents(httpServer) {
		var api = this;

		var wss = new WebSocketServer({server: httpServer});
		var emitConnectionEvent = api.emit.bind(api, 'connection');

		wss.on('connection', emitConnectionEvent);
	};
};
