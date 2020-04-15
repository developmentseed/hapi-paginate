/* global require, describe, it */
'use strict';

var Hapi = require('@hapi/hapi');
var expect = require('chai').expect;

var register = function () {
  var server = new Hapi.Server();
  server.route({ method: 'GET', path: '/', handler: function (request, h) { return 'ok'; }});

  return server;
};

describe('hapi-test', function () {
  it('test if limit is added to request', async function (done) {
    var server = register();
    await server.register(require('../'));
    var request = { method: 'GET', url: '/'};
    var res = await server.inject(request);
    expect(res.request.limit).to.equal(100);
    done();
  });

  it('test if page is added to request', async function (done) {
    var server = register();
    await server.register(require('../'));
    var request = { method: 'GET', url: '/'};
    var res = await server.inject(request);
    expect(res.request.page).to.equal(1);
    done();
  });

  it('test if page and limit are captured from query params', async function (done) {
    var server = register();
    await server.register(require('../'));

    // call page and limit
    var request = { method: 'GET', url: '/?page=3&limit=10'};
    var res = await server.inject(request);
    expect(res.request.page).to.equal(3);
    expect(res.request.limit).to.equal(10);

    // call again withtout them and make sure page is back to default value
    var request = { method: 'GET', url: '/'};
    var res = await server.inject(request);
    expect(res.request.page).to.equal(1);
    expect(res.request.limit).to.equal(100);

    // call again with them and see if correct value is returned
    var request = { method: 'GET', url: '/?page=4&limit=11'};
    var res = await server.inject(request);
    expect(res.request.page).to.equal(4);
    expect(res.request.limit).to.equal(11);
    done();
  });

  it('test response output', async function (done) {
    var server = register();
    await server.register(require('../'));

    var request = { method: 'GET', url: '/'};
    var res = await server.inject(request);
    var output = {
      meta: {
        page: 1,
        limit: 100
      },
      results: 'ok'
    };
    expect(res.result).to.have.all.keys(output);
    done();
  });

  it('test with options', async function (done) {
    var server = register();
    var plugin = {
      plugin: require('../'),
      options: {
        limit: 1000,
        name: 'Some Name',
        results: 'output'
      }
    };
    await server.register(plugin);

    var request = { method: 'GET', url: '/'};
    var res = await server.inject(request);
    expect(res.request.limit).to.equal(1000);
    expect(res.result).to.have.all.keys(['Some Name', 'output']);
    done();
  });

  it('test when meta already exist', async function (done) {
    var server = register();

    var output = {
      meta: {
        provided_by: 'company',
        domain: 'example.com'
      },
      results: 'ok'
    };

    server.route({ method: 'GET', path: '/new', handler: function (request, h) { return output; }});
    await server.register(require('../'));

    var request = { method: 'GET', url: '/new'};
    var res = await server.inject(request);
    output.meta.page = 1;
    output.meta.limit = 100;
    expect(res.result).to.have.all.keys(output);
    done();
  });

  it('test route option', async function (done) {
    var server = register();

    var output = {
      meta: {
        provided_by: 'company',
        domain: 'example.com'
      },
      results: 'ok'
    };

    server.route({
      method: 'GET',
      path: '/with',
      handler: function (request, h) {
        return output;
      }
    });
    server.route({
      method: 'GET',
      path: '/without',
      handler: function (request, h) {
        return {this: 'that'};
      }
    });
    server.route({
      method: 'GET',
      path: '/with_meta',
      handler: function (request, h) {
        return {
          meta: {
            important: 'yes'
          },
          results: {
            this: 'that'
          }
        };
      }
    });
    await server.register({
      plugin: require('../'),
      options: {
        routes: ['/with']
      }
    });

    var request = { method: 'GET', url: '/with'};
    var res = await server.inject(request);
    expect(res.result.meta).to.have.any.keys('page', 'limit');

    var request = { method: 'GET', url: '/without'};
    var res = await server.inject(request);
    expect(res.result).to.not.have.any.keys('meta');

    var request = { method: 'GET', url: '/with_meta'};
    var res = await server.inject(request);
    expect(res.result.meta).to.not.have.any.keys('page', 'limit');
    done();
  });

  it('test exclude option', async function (done) {
    var server = register();
    var plugin = {
      plugin: require('../'),
      options: {
        limit: 1000,
        name: 'Some Name',
        excludeFormats: ['csv']
      }
    };
    await server.register(plugin);

    var request = { method: 'GET', url: '/?format=csv'};
    var res = await server.inject(request);
    expect(res.result).to.equal('ok');
    done();
  });

});
