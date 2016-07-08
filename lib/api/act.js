/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function act(pattern, context, done) {
		var api = this;
		var handlers = api.actions.list(pattern);
		var callActions = _callActions.bind(
			api,
			pattern, context
		);
		var callback = done ? done : _.noop;

		async.each(handlers, callActions, callback);
	};
};

function _callActions(pattern, context, handler, done) {
	var api = this;
	handler.call(api, pattern, context, done);
}
