/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async) {
	return function addRegistrar(registrars, done) {
		var api = this;
		var registers = _.keys(registrars);
		var addRegisterListener = _addRegisterListener.bind(
			null,
			api, registrars
		);
		var callback = done ? done : _.noop;

		async.each(registers, addRegisterListener, callback);
	};
};

function _addRegisterListener(api, registrars, register, done) {
	var registerEvent = 'register:' + register;

	api.setDefaultListener(registerEvent, registrars[register], done);
}
