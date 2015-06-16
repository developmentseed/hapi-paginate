## hapi-paginate

[![npm version](https://badge.fury.io/js/hapi-paginate.svg)](http://badge.fury.io/js/hapi-paginate)
[![Build Status](https://travis-ci.org/developmentseed/hapi-paginate.svg?branch=master)](https://travis-ci.org/developmentseed/hapi-paginate)

A basic pagination plugin for [Hapi](http://hapijs.com/).

The plugin listens to `page` and `limit` query parameters and add them to `request` object.

The Hapi app should decide how to handle `request.page` and `request.limit` values.

The plugin then adds a `meta` key to the output json response and move the response under `results` key.

To limit the plugin to specific routes, adds `routes` to options.

### Example

curl -X GET http://www.example.com?page=3&limit=100

```json
{
    "meta": {
        "page": 3,
        "limit": 100
    },
    "results": {
        "key": "value"
    }
}
```
### Installation

    $: npm install hapi-paginate

### Registration

```javascript
var Hapi = require('hapi');

var hapi = new Hapi.Server();
hapi.connection();

hapi.register({
  register: require('hapi-paginate'),
  options: {
    limit: 1000,
    name: 'My Meta',
    results: 'output',
    routes: ['/', '/api']
  }
};
```

### Test

    $ npm test
