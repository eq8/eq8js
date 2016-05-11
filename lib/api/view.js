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

		// TODO: there should be only one result
		async.map(results, callViews, done);
	};
};

function _callViews(context, result, done) {
	var api = this;
	var handler = result.handler;
	var params = result.params;

	handler.call(api, params, context, done);
}
