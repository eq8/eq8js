/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function viewRegistrar(views, done, prior) {
		var api = this;

		var addView = async.apply(_addView, api, _, getPattern);

		async.waterfall([
			async.apply(prior, views),
			async.apply(addViews, async, addView, views)
		], done);
	};
};

function _addView(api, _, handler, view, done) {
	var uri = view.pattern.uri;

	api.router.add({path: uri, handler: handler.bind(null, _, uri)});

	done();
}

function getPattern(_, uri, routeObj) {
	return _.assign({}, {uri: uri}, routeObj.params);
}

function addViews(async, addView, views, done) {
	return async.each(views, addView, done);
}
