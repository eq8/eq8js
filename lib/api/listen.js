'use strict';

module.exports = function exported(_, Core, WebSocketServer) {
	function setMessageHandler(err, api, ws, location, user) {
		if (err) {
			return api.logger.error(err);
		}

		var emitMessageEvent = _.bind(
			api.emit,
			api,
			'message', ws, location, user
		);

		return ws.on('message', emitMessageEvent);
	}

	return function listen(port) {
		var api = this;

		Core.prototype.listen.call(api, port, function(httpServer) {
			var wss = new WebSocketServer({server: httpServer});
			var emitConnectionEvent = _.bind(
				api.emit,
				api,
				'connection'
			);

			httpServer.on('request', api.express);

			wss.on('connection', function callback(ws) {
				emitConnectionEvent(ws, setMessageHandler);
			});
		});
	};
};

