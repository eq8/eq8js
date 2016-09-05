/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async, passport, Joi) {
	return function registerViews(views, done /* , prior */) {
		var api = this;

		var schema = Joi
			.array()
			.items(
				Joi.object({
					name: Joi.string().required(),
					pattern: Joi.object({
						uri: Joi.string().required()
					}).required(),
					handler: Joi.func().arity(3)
				})
			);
		var validate = Joi.validate.bind(Joi, views, schema, {convert: false});
		var addView = _addView.bind(null, api, _, passport);
		var addViews = _addViews.bind(null, async, addView);

		async.waterfall([
			validate,
			addViews
		], done);

	};

};

function _addViews(async, addView, views, done) {
	async.eachSeries(views, addView, done);
}

function _addView(api, _, passport, view, done) {
	var defaultHandler = _defaultHandler.bind(
		null,
		_, api, view.pattern.uri
	);
	api.middleware.use(view.pattern.uri, passport.authenticate(['jwt', 'anonymous'], {session: false}));
	api.middleware.use(view.pattern.uri, defaultHandler);

	var pattern = _.defaults({}, view.pattern);

	api.views.add(pattern, view.handler);

	return done();
}

function _defaultHandler(_, api, uri, req, res, next) {
	var context = {
		req: req,
		res: res
	};
	var pattern = _.defaults({}, {uri: uri}, req.params);
	var done = _done.bind(null, next);

	api.view(context, pattern, done);
}

function _done(next) {

	next();
}
