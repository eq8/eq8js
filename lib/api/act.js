/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function act(context, pattern) {
		var api = this;
		var handlers = api.actions.list(pattern);
		var callHandlers = _callHandlers.bind(
			api,
			context, pattern
		);

		async.each(handlers, callHandlers);
	};
};

function _callHandlers(context, pattern, handler, done) {
	var api = this;

	handler.call(api, context, pattern, done);
}
