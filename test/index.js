/*global describe, it*/
var expect = require('unexpected');
var urlTools = require('../lib');

describe('urlTools', function () {
    describe('buildRelativeUrl', function () {
        describe('with different protocols', function () {
            it('should return an absolute url', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://example.com/the/thing.html',
                    'file:///home/thedude/stuff.png'
                ), 'to equal', 'file:///home/thedude/stuff.png');
            });
        });

        describe('with http urls, same host name', function () {
            it('should return a relative url', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://example.com/the/thing.html',
                    'file:///home/thedude/stuff.png'
                ), 'to equal', 'file:///home/thedude/stuff.png');
            });
        });

        describe('with http urls, different host names', function () {
            it('should return a protocol-relative url', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://example.com/index.html',
                    'http://other.com/index.html'
                ), 'to equal', '//other.com/index.html');
            });
        });

        describe('from an http url to the same url', function () {
            it('should return the empty string', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://example.com/index.html',
                    'http://example.com/index.html'
                ), 'to equal', '');
            });
        }); 

        describe('with a trailing question mark', function () {
            it('should preserve the question mark', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://foo.com/index.html',
                    'http://foo.com/other.html?'
                ), 'to equal', 'other.html?');
            });
        }); 

        describe('with a trailing question mark and a fragment identifier', function () {
            it('should preserve both', function () {
                expect(urlTools.buildRelativeUrl(
                    'file:///foobar/index.css',
                    'file:///foobar/fontawesome-webfont.eot?#iefix'
                ), 'to equal', 'fontawesome-webfont.eot?#iefix');
            });
        }); 

        describe('to the same url with a fragment identifier', function () {
            it('should just return the fragment', function () {
                expect(urlTools.buildRelativeUrl(
                    'http://example.com/index.html',
                    'http://example.com/index.html#foo'
                ), 'to equal', '#foo');
            });
        }); 

        it('should build a relative url to a file in a dir one level up', function () {
            expect(urlTools.buildRelativeUrl(
                'file:///home/andreas/mystuff.txt',
                'file:///home/anders/hisstuff.txt'
            ), 'to equal', '../anders/hisstuff.txt');
        });

        it('should build a relative url to a file in a dir one level up', function () {
            expect(urlTools.buildRelativeUrl(
                'file:///home/andreas/mystuff.txt',
                'file:///home/otherguy/hisstuff.txt'
            ), 'to equal', '../otherguy/hisstuff.txt');
        });

        it('should build a relative url to a file one level down', function () {
            expect(urlTools.buildRelativeUrl(
                'file:///home/andreas/work/oneweb/http-pub/',
                'file:///home/andreas/work/oneweb/http-pub/static/413c60cd8d.css'
            ), 'to equal', 'static/413c60cd8d.css');
        });

        it('should build a relative url to a url with comma in the query string', function () {
            expect(urlTools.buildRelativeUrl(
                'file:///foobar/index.html',
                'file:///foobar/banner-phone.jpeg?foo,bar'
            ), 'to equal', 'banner-phone.jpeg?foo,bar');
        });

        it('should build a relative url to a url with comma in the fragment identifier', function () {
            expect(urlTools.buildRelativeUrl(
                'file:///foobar/index.html',
                'file:///foobar/banner-phone.jpeg#foo,bar'
            ), 'to equal', 'banner-phone.jpeg#foo,bar');
        });    
    });

    describe('buildRootRelativeUrl', function () {
        it('should build a root-relative url from file: to file: inside root', function () {
            expect(urlTools.buildRootRelativeUrl(
                'file:///path/to/root/some/asset.html',
                'file:///path/to/root/some/other/asset.html',
                'file:///path/to/root/'
            ), 'to equal', '/some/other/asset.html');
        });

        it('should build a relative url from file: to file: outside root (rather than an absolute one)', function () {
            expect(urlTools.buildRootRelativeUrl(
                'file:///some/path/to/root/some/asset.html',
                'file:///some/path/somewhere/else.html',
                'file:///some/path/to/root/'
            ), 'to equal', '../../../somewhere/else.html');
        });
    });

    describe('findCommonUrlPrefix', function () {
        it('should work with different protocols', function () {
            expect(urlTools.findCommonUrlPrefix(
                'http://example.com/the/thing.html', 'file:///home/thedude/stuff.png'
            ), 'to equal', '');
        });

        it('should work from and to http, same hostname', function () {
            expect(urlTools.findCommonUrlPrefix(
                'http://example.com/the/thing.html', 'http://example.com/the/other/stuff.html'
            ), 'to equal', 'http://example.com/the');
        });

        it('should work from and to http, different hostname', function () {
            expect(urlTools.findCommonUrlPrefix(
                'http://example.com/index.html', 'http://other.com/index.html'
            ), 'to equal', '');
        });

        it('should work to file in dir one level up with shared prefix', function () {
            expect(urlTools.findCommonUrlPrefix(
                'file:///home/andreas/mystuff.txt', 'file:///home/anders/hisstuff.txt'
            ), 'to equal', 'file:///home');
        });

        it('should work to file in dir one level up', function () {
            expect(urlTools.findCommonUrlPrefix(
                'file:///home/andreas/mystuff.txt', 'file:///home/otherguy/hisstuff.txt'
            ), 'to equal', 'file:///home');
        });

        it('should work to file one level down', function () {
            expect(urlTools.findCommonUrlPrefix(
                'file:///home/andreas/work/oneweb/http-pub/', 'file:///home/andreas/work/oneweb/http-pub/static/413c60cd8d.css'
            ), 'to equal', 'file:///home/andreas/work/oneweb/http-pub');
        });

        it('should work to file, to different root directories', function () {
            expect(urlTools.findCommonUrlPrefix(
                'file:///home/andreas/', 'file:///etc/'
            ), 'to equal', 'file://');
        });

        it('should work on empty input', function () {
            expect(urlTools.findCommonUrlPrefix(), 'to equal', '');
        });

        it('should work with a single file url as input', function () {
            expect(urlTools.findCommonUrlPrefix(
                'file:///home/munter/blog/index.html'
            ), 'to equal', 'file:///home/munter/blog/');
        });

        it('should work with a single http url with a trailing slash as input', function () {
            expect(urlTools.findCommonUrlPrefix(
                'http://mntr.dk/'
            ), 'to equal', 'http://mntr.dk/');
        });

        it('should work with a single http url with no trailing slash as input', function () {
            expect(urlTools.findCommonUrlPrefix(
                'http://mntr.dk'
            ), 'to equal', 'http://mntr.dk');
        });

        it('should work with a single https url with a trailing slash as input', function () {
            expect(urlTools.findCommonUrlPrefix(
                'https://mntr.dk/'
            ), 'to equal', 'https://mntr.dk/');
        });

        it('should work with a single https url with no trailing slash as input', function () {
            expect(urlTools.findCommonUrlPrefix(
                'https://mntr.dk'
            ), 'to equal', 'https://mntr.dk');
        });
    });
});

describe('on Windows', function () {
    var originalPlatform = process.platform;
    beforeEach(function () {
        Object.defineProperty(process, 'platform', { value: 'win32' });
    });
    afterEach(function () {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    describe('#urlOrFsPathToUrl', function () {
        it('should reinstate the drive letter in decoded form', function () {
            expect(
                urlTools.fileUrlToFsPath('file:///C%3A/foo/bar%20quux.png'),
                'to equal',
                'C:/foo/bar quux.png'
            );
        });
    });
});
