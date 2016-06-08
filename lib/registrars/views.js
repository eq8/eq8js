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
	} else if (!_.isObject(view.pattern) || !_.isString(view.pattern.uri)) {
		return done(new Error('supplied view pattern is not an object'));
	} else if (!_.isFunction(view.handler)) {
		return done(new Error('supplied view handler is not a function'));
	}

	var defaultHandler = _defaultHandler.bind(
		null,
		_, api, view.pattern.uri
	);
	api.express.all(view.pattern.uri, defaultHandler);

	var pattern = _.defaults({}, view.pattern);

	api.views.add(pattern, view.handler);
}

function _defaultHandler(_, api, uri, request, res, next) {
	var req = _.pick(request, ['user', 'method', 'hostname', 'query', 'body']);
	var context = {
		req: req,
		res: res,
		next: next
	};
	var pattern = _.defaults({}, {uri: uri}, req.params);
	var done = _.partial(_done, res);

	api.view(pattern, context, done);
}

function _done(res) {
	res.end();
}
