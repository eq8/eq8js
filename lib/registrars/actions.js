/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function registerActions(actions, done /* , prior */) {
		var api = this;

		if (!_.isArray(actions)) {
			return done(new Error('supplied actions argument is not an array'));
		}

		var addObservers = _.partial(_addObservers, api, _);
		return async.eachSeries(actions, addObservers, done);
	};

};

function _addObservers(api, _, action, done) {
	// TODO: jsonschema-validator
	if (!action) {
		return done(new Error('supplied action is invalid'));
	} else if (!action.name) {
		return done(new Error('action name required'));
	} else if (!_.isObject(action.pattern)) {
		return done(new Error('supplied action pattern is not an object'));
	} else if (!_.isFunction(action.handler)) {
		return done(new Error('supplied action handler is not a function'));
	}

	api._observers.add(action.pattern, action.handler);

	return done();
}
