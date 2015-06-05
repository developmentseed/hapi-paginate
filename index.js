/* global require, exports, module */
'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  var page = 1;
  var limit = options.limit || 100;
  var name = options.name || 'meta';
  var results = options.results || 'results';

  server.ext('onPreHandler', function (request, reply) {
    page = 1;
    limit = options.limit || 100;

    if (_.has(request.query, 'page')) {
      page = _.parseInt(request.query.page);
      request.query = _.omit(request.query, 'page');
    }

    if (_.has(request.query, 'limit')) {
      limit = _.parseInt(request.query.limit);
      request.query = _.omit(request.query, 'limit');
    }

    request.page = page;
    request.limit = limit;

    return reply.continue();
  });

  server.ext('onPreResponse', function (request, reply) {
    var meta = {
    page: request.page,
    limit: request.limit
    };

    if (_.has(request, 'count')) {
      meta.found = request.count;
    }

    if (_.has(request.response.source, name)) {
      request.response.source[name] = _.merge(request.response.source[name], meta);
    } else {
      // Because we want to add meta to top of the source, we have to go through all this hastle
      var temp = request.response.source;
      request.response.source = {};
      request.response.source[name] = meta;
      request.response.source[results] = temp;
    }

    return reply.continue();
  });

  next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
