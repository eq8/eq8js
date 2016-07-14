/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async, Joi) {
	return function registerActions(actions, done /* , prior */) {
		var api = this;

		var schema = Joi
			.array()
			.items(
				Joi.object({
					name: Joi.string().required(),
					pattern: Joi.object().required(),
					handler: Joi.func().arity(3)
				})
			);
		var validate = Joi.validate.bind(Joi, actions, schema, {convert: false});
		var addAction = _addAction.bind(null, api, _);
		var addActions = _addActions.bind(null, async, addAction);

		async.waterfall([
			validate,
			addActions
		], done);

	};

};

function _addAction(api, _, action, done) {
	api.actions.add(action.pattern, action.handler);

	return done();
}

function _addActions(async, addAction, actions, done) {
	async.eachSeries(actions, addAction, done);
}
