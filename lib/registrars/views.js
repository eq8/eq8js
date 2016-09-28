/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_, async, Rx) {
	return function viewRegistrar(views, done, prior) {
		var api = this;

		async.series([
			async.apply(prior, views),
			async.apply(addViews, api, _, Rx, getPattern.bind(null, _), views)
		], done);
	};
};

function addViews(api, _, Rx, handler, views, done) {
	Rx.Observable
		.from(views)
		.filter(hasPatternUri)
		.select(getPatternUri)
		.distinct()
		.subscribe(
			onNext.bind(null, api, _, handler),
			done,
			done
		);
}

function getPattern(_, uri, routeObj) {
	return _.assign({}, {uri: uri}, routeObj.params);
}

function hasPatternUri(view) {
	return view && view.pattern && view.pattern.uri;
}

function getPatternUri(view) {
	return view.pattern.uri;
}

function onNext(api, _, handler, uri) {
	api.router.add({path: uri, handler: handler.bind(null, uri)});
}
