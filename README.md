# EQuateJS (eq8js)

[![npm](https://img.shields.io/npm/v/eq8.svg?maxAge=2592000)](https://npmjs.com/package/eq8) [![node](https://img.shields.io/node/v/eq8.svg?maxAge=2592000)](https://npmjs.com/package/eq8) [![David](https://img.shields.io/david/eq8/eq8js.svg?maxAge=2592000)](https://david-dm.org/eq8/eq8js) [![Travis](https://travis-ci.org/eq8/eq8js.svg?branch=master)](https://travis-ci.org/eq8/eq8js) [![codecov](https://codecov.io/gh/eq8/eq8js/branch/master/graph/badge.svg)](https://codecov.io/gh/eq8/eq8js)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Contents

- [Installation](#installation)
- [Example](#example)
- [More Info](#more-info)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm install --save eq8
```

## Example

```
var api = require('eq8')({jwt: {secret: 'secret'}});

var state = {};

api.register({
	actions: [
		{
			name: 'Change State',
			pattern: {
				cmd: 'update'
			},
			handler: function(ctxt, args) {
				state[args.id] = args.value;
			}
		}
	],
	views: [
		{
				name: 'View State',
				pattern: {
					uri: '/state/:id'
				},
				handler: function(ctxt, args, done) {
					done(null, state[args.id]);
				}
		}
	]
});

// Listen on port 8080
api.listen(8080);

```

The example above registers an **Action** that can be triggered via a WebSocket connection - as shown below - to modify the `state` object.

```
var WebSocket = require('ws');
var ws = new WebSocket('http://localhost:8080');

ws.on('open', function() {
	ws.send(JSON.stringify({
		cmd: 'update',
		id:'1',
		value: 'foo'
	}));
});
```

The `state` for any specific `id` was also made available via a web interface at `http://localhost:8080/state/:id` by registering another concept called a **View**.

```
$ curl http://localhost:8080/state/1
foo
```

## More Info
This package extends the [eq8-api](https://www.npmjs.com/package/eq8-api) and [eq8-core](https://www.npmjs.com/package/eq8-core) packages with more details and examples available at [https://eq8.js.org](https://eq8.js.org)
