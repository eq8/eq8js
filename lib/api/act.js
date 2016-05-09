/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function act(action, context, done) {
		var api = this;
		var handlers = api.actions.list(action);
		var callActions = _callActions.bind(
			api,
			action, context
		);
		var callback = done ? done : _.noop;

		async.each(handlers, callActions, callback);
	};
};

function _callActions(action, context, handler, done) {
	var api = this;
	handler.call(api, action, context, done);
}
