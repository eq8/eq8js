/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function registerViews(views, done /* , prior */) {
		var api = this;

		if (!_.isArray(views)) {
			return done(new Error('supplied views argument is not an array'));
		}

		var addViews = _addViews.bind(null, api, _);
		return async.eachSeries(views, addViews, done);
	};

};

function _addViews(api, _, view, done) {
	// TODO: jsonschema-validator
	if (!view) {
		return done(new Error('supplied view is invalid'));
	} else if (!view.name) {
		return done(new Error('view name required'));
	} else if (!_.isString(view.uri)) {
		return done(new Error('supplied view uri is not a string'));
	} else if (!_.isFunction(view.handler)) {
		return done(new Error('supplied view handler is not a function'));
	}

	api.views.add([{path: view.uri, handler: view.handler}]);

	return done();
}

