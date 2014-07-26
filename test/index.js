var vows = require('vows'),
    assert = require('assert'),
    urlTools = require('../lib');

vows.describe('Utility functions in urlTools').addBatch({
    'buildRelativeUrl with different protocols': {
        topic: urlTools.buildRelativeUrl('http://example.com/the/thing.html', 'file:///home/thedude/stuff.png'),
        'should give up and return the absolute target url': function (relativeUrl) {
            assert.equal(relativeUrl, 'file:///home/thedude/stuff.png');
        }
    },
    'buildRelativeUrl from and to http, same hostname': {
        topic: urlTools.buildRelativeUrl('http://example.com/the/thing.html', 'http://example.com/the/other/stuff.html'),
        'should build a proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, 'other/stuff.html');
        }
    },
    'buildRelativeUrl from and to http, different hostname': {
        topic: urlTools.buildRelativeUrl('http://example.com/index.html', 'http://other.com/index.html'),
        'should give up and return the absolute target url': function (relativeUrl) {
            assert.equal(relativeUrl, 'http://other.com/index.html');
        }
    },
    'buildRelativeUrl to file in dir one level up with shared prefix': {
        topic: urlTools.buildRelativeUrl('file:///home/andreas/mystuff.txt', 'file:///home/anders/hisstuff.txt'),
        'should build the proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, '../anders/hisstuff.txt');
        }
    },
    'buildRelativeUrl to file in dir one level up': {
        topic: urlTools.buildRelativeUrl('file:///home/andreas/mystuff.txt', 'file:///home/otherguy/hisstuff.txt'),
        'should build the proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, '../otherguy/hisstuff.txt');
        }
    },
    'buildRelativeUrl to file one level down': {
        topic: urlTools.buildRelativeUrl('file:///home/andreas/work/oneweb/http-pub/', 'file:///home/andreas/work/oneweb/http-pub/static/413c60cd8d.css'),
        'should build the proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, 'static/413c60cd8d.css');
        }
    },


    'findCommonUrlPrefix with different protocols': {
        topic: urlTools.findCommonUrlPrefix('http://example.com/the/thing.html', 'file:///home/thedude/stuff.png'),
        'should return an empty string': function (relativeUrl) {
            assert.equal(relativeUrl, '');
        }
    },
    'findCommonUrlPrefix from and to http, same hostname': {
        topic: urlTools.findCommonUrlPrefix('http://example.com/the/thing.html', 'http://example.com/the/other/stuff.html'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, 'http://example.com/the');
        }
    },
    'findCommonUrlPrefix from and to http, different hostname': {
        topic: urlTools.findCommonUrlPrefix('http://example.com/index.html', 'http://other.com/index.html'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, '');
        }
    },
    'findCommonUrlPrefix to file in dir one level up with shared prefix': {
        topic: urlTools.findCommonUrlPrefix('file:///home/andreas/mystuff.txt', 'file:///home/anders/hisstuff.txt'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, 'file:///home');
        }
    },
    'findCommonUrlPrefix to file in dir one level up': {
        topic: urlTools.findCommonUrlPrefix('file:///home/andreas/mystuff.txt', 'file:///home/otherguy/hisstuff.txt'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, 'file:///home');
        }
    },
    'findCommonUrlPrefix to file one level down': {
        topic: urlTools.findCommonUrlPrefix('file:///home/andreas/work/oneweb/http-pub/', 'file:///home/andreas/work/oneweb/http-pub/static/413c60cd8d.css'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, 'file:///home/andreas/work/oneweb/http-pub');
        }
    },
    'findCommonUrlPrefix to file, to different root directories': {
        topic: urlTools.findCommonUrlPrefix('file:///home/andreas/', 'file:///etc/'),
        'should find the common prefix': function (relativeUrl) {
            assert.equal(relativeUrl, 'file://');
        }
    }
})['export'](module);
