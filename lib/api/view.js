/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function view(urlPath, context, done) {
		var api = this;
		var results = api.views.recognize(urlPath);
		var callViews = _callViews.bind(
			api,
			context
		);
		var callback = done ? done : _.noop;

		async.each(results, callViews, callback);
	};
};

function _callViews(context, result, done) {
	var api = this;
	var handler = result.handler;
	var params = result.params;

	handler.call(api, params, context, done);
}
