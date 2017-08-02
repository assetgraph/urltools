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
        'should build a protocol-relative url': function (relativeUrl) {
            assert.equal(relativeUrl, '//other.com/index.html');
        }
    },
    'buildRelativeUrl to the same url': {
        topic: urlTools.buildRelativeUrl('http://example.com/index.html', 'http://example.com/index.html'),
        'should return the empty string': function (relativeUrl) {
            assert.equal(relativeUrl, '');
        }
    },
    'buildRelativeUrl with a trailing question mark': {
        topic: urlTools.buildRelativeUrl('http://example.com/index.html', 'other.html?'),
        'should preserve the question mark': function (relativeUrl) {
            assert.equal(relativeUrl, 'other.html?');
        }
    },
    'buildRelativeUrl with a trailing question mark and fragment identifier': {
        topic: urlTools.buildRelativeUrl('file:///foobar/index.css', 'file:///foobar/fontawesome-webfont.eot?#iefix'),
        'should preserve the question mark': function (relativeUrl) {
            assert.equal(relativeUrl, 'fontawesome-webfont.eot?#iefix');
        }
    },

    'buildRelativeUrl to the same url with a fragment': {
        topic: urlTools.buildRelativeUrl('http://example.com/index.html', 'http://example.com/index.html#foo'),
        'should just return the fragment': function (relativeUrl) {
            assert.equal(relativeUrl, '#foo');
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
    'buildRelativeUrl to url with comma in the query string': {
        topic: urlTools.buildRelativeUrl('file:///foobar/index.html', 'file:///foobar/banner-phone.jpeg?foo,bar'),
        'should build the proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, 'banner-phone.jpeg?foo,bar');
        }
    },
    'buildRelativeUrl to url with comma in the fragment identifier': {
        topic: urlTools.buildRelativeUrl('file:///foobar/index.html', 'file:///foobar/banner-phone.jpeg#foo,bar'),
        'should build the proper relative url': function (relativeUrl) {
            assert.equal(relativeUrl, 'banner-phone.jpeg#foo,bar');
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
    },
    'findCommonUrlPrefix on empty input': {
        topic: urlTools.findCommonUrlPrefix(),
        'should return the empty string': function (relativeUrl) {
            assert.equal(relativeUrl, '');
        }
    },
    'findCommonUrlPrefix with a single file url as input': {
        topic: urlTools.findCommonUrlPrefix('file:///home/munter/blog/index.html'),
        'should find the deepest directory': function (relativeUrl) {
            assert.equal(relativeUrl, 'file:///home/munter/blog/');
        }
    },
    'findCommonUrlPrefix with a single http url with a trailing slash as input': {
        topic: urlTools.findCommonUrlPrefix('http://mntr.dk/'),
        'should return the domain': function (relativeUrl) {
            assert.equal(relativeUrl, 'http://mntr.dk/');
        }
    },
    'findCommonUrlPrefix with a single http url with no trailing slash as input': {
        topic: urlTools.findCommonUrlPrefix('http://mntr.dk'),
        'should return the domain': function (relativeUrl) {
            assert.equal(relativeUrl, 'http://mntr.dk');
        }
    },
    'findCommonUrlPrefix with a single https url with a trailing slash as input': {
        topic: urlTools.findCommonUrlPrefix('https://mntr.dk/'),
        'should return the domain': function (relativeUrl) {
            assert.equal(relativeUrl, 'https://mntr.dk/');
        }
    },
    'findCommonUrlPrefix with a single https url with no trailing slash as input': {
        topic: urlTools.findCommonUrlPrefix('https://mntr.dk'),
        'should return the domain': function (relativeUrl) {
            assert.equal(relativeUrl, 'https://mntr.dk');
        }
    }
})['export'](module);
