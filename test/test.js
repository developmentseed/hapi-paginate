/* global require, describe, it, before */
'use strict';

var Hapi = require('hapi');
var expect = require('chai').expect;

var register = function () {
  var server = new Hapi.Server();
  server.connection();
  server.route({ method: 'GET', path: '/', handler: function (request, reply) { return reply('ok'); }});

  return server;
};

describe('hapi-test', function () {
  it('test if limit is added to request', function (done) {
    var server = register();
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
        expect(res.request.limit).to.equal(100);
        done();
      });
    });
  });

  it('test if page is added to request', function (done) {
    var server = register();
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
        expect(res.request.page).to.equal(1);
        done();
      });
    });
  });

  it('test if page and limit are captured from query params', function (done) {
    var server = register();
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/?page=3&limit=10'};
      server.inject(request, function (res) {
        expect(res.request.page).to.equal(3);
        expect(res.request.limit).to.equal(10);
        done();
      });
    });
  });

  it('test response output', function (done) {
    var server = register();
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
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
    });
  });

  it('test with options', function (done) {
    var server = register();
    var plugin = {
      register: require('../'),
      options: {
        limit: 1000,
        name: 'Some Name',
        results: 'output'
      }
    };
    server.register(plugin, function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/'};
      server.inject(request, function (res) {
        expect(res.request.limit).to.equal(1000);
        expect(res.result).to.have.all.keys(['Some Name', 'output']);
        done();
      });
    });
  });

  it('test when meta already exist', function (done) {
    var server = register();

    var output = {
      meta: {
        provided_by: 'company',
        domain: 'example.com'
      },
      results: 'ok'
    };

    server.route({ method: 'GET', path: '/new', handler: function (request, reply) { return reply(output); }});
    server.register(require('../'), function (err) {
      expect(err).to.be.empty;

      var request = { method: 'GET', url: '/new'};
      server.inject(request, function (res) {
        output.meta.page = 1;
        output.meta.limit = 100;
        expect(res.result).to.have.all.keys(output);
        done();
      });
    });
  });
});

