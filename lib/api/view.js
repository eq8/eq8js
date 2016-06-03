/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function view(pattern, context, done) {
		var api = this;
		var handlers = api.views.list(pattern);
		var callViews = _callViews.bind(
			api,
			pattern, context
		);
		var callback = done ? done : _.noop;

		async.each(handlers, callViews, callback);
	};
};

function _callViews(pattern, context, handler, done) {
	var api = this;
	handler.call(api, pattern, context, done);
}
