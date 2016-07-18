'use strict';

module.exports = function exported() {
	return function addMessageContext(ws, user, message /* , done */) {
		var api = this;
		var write = _write.bind(null, ws);
		var error = _error.bind(null, ws);
		var context = {
			req: {
				user: user
			},
			res: {
				write: write,
				error: error
			}
		};

		var newEvent = JSON.parse(message);

		api.act(newEvent, context /* , done */);
	};
};

function _write(ws, message, options) {
	ws.send(JSON.stringify({data: message}), options);
}

function _error(ws, error, options) {
	ws.send(JSON.stringify({error: error}), options);
}
