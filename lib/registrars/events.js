/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function registerEvents(events, done /* , prior */) {
		var api = this;

		if (!_.isArray(events)) {
			return done(new Error('supplied events argument is not an array'));
		}

		var addEvents = _addEvents.bind(null, api, _);
		return async.eachSeries(events, addEvents, done);
	};

};

function _addEvents(api, _, e, done) {
	// TODO: jsonschema-validator
	if (!e) {
		return done(new Error('supplied event is invalid'));
	} else if (!e.name) {
		return done(new Error('event name required'));
	} else if (!_.isObject(e.pattern)) {
		return done(new Error('supplied event pattern is not an object'));
	} else if (!_.isFunction(e.handler)) {
		return done(new Error('supplied event handler is not a function'));
	}

	api.seneca.add(e.pattern, e.handler);

	return done();
}
