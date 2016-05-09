/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function act(pattern, context, done) {
		var api = this;
		var actions = api.actions.list(pattern);
		var callActions = _callActions.bind(
			null,
			pattern, context
		);
		var callback = done ? done : _.noop;

		async.each(actions, callActions, callback);
	};
};

function _callActions(pattern, context, action, done) {
	action(pattern, context, done);
}
