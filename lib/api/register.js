/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	function _emitRegisterEvent(api, args, register, done) {
		var registerEvent = 'register:' + register;

		api.emit(registerEvent, args[register], done);
	}

	return function register(args, done) {
		var api = this;
		var registers = _.keys(args);
		var emitRegisterEvent = _.partial(
			_emitRegisterEvent,
			api, args
		);
		var callback = done ? done : _.noop;

		async.each(registers, emitRegisterEvent, callback);
	};
};
