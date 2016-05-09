'use strict';

module.exports = function exported(_, http, WebSocketServer) {
	function setMessageHandler(err, api, ws, user) {
		if (err) {
			return api.logger.error(err);
		}

		var emitMessageEvent = _.bind(
			api.emit,
			api,
			'message', ws, user
		);

		return ws.on('message', emitMessageEvent);
	}

	return function listen() {
		var api = this;
		var server = http.createServer(api.express);
		var wss = new WebSocketServer({server: server});
		var emitConnectionEvent = _.bind(
			api.emit,
			api,
			'connection'
		);

		wss.on('connection', function callback(ws) {
			emitConnectionEvent(ws, setMessageHandler);
		});

		return server.listen.apply(server, arguments);
	};
};

