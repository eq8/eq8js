'use strict';

module.exports = function exported() {
	return function addMessageContext(ws, user, message /* , done */) {
		var api = this;
		var write = _write.bind(null, ws);
		var context = {
			req: {
				user: user
			},
			res: {
				write: write
			}
		};

		var newEvent = JSON.parse(message);

		api.act(context, newEvent);
	};
};

function _write(ws, message, options) {
	ws.send(message, options);
}
