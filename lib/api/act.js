/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function act(newEvent, context, done) {
		var api = this;
		var observers = api._observers.list(newEvent);
		var callObservers = _callObservers.bind(
			null,
			newEvent, context
		);
		var callback = done ? done : _.noop;

		async.each(observers, callObservers, callback);
	};
};

function _callObservers(newEvent, context, observer, done) {
	observer(newEvent, context, done);
}
