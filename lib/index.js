var Url = require('url'),
    Path = require('path'),
    glob = require('glob'),
    _ = require('underscore');

exports.getCommonPrefix = function (url1, url2) {
    var minLength = Math.min(url1.length, url2.length),
        commonPrefixLength = 0;
    while (commonPrefixLength < minLength && url1[commonPrefixLength] === url2[commonPrefixLength]) {
        commonPrefixLength += 1;
    }
    var commonPrefix = url1.substr(0, commonPrefixLength),
        commonPrefixMatch = commonPrefix.match(/^(file:\/\/|[^:]+:\/\/[^\/]+\/)/);

    if (commonPrefixMatch) {
        return commonPrefixMatch[1];
    }
};

exports.buildRelativeUrl = function (fromUrl, toUrl) {
    var commonPrefix = exports.getCommonPrefix(fromUrl, toUrl);
    if (commonPrefix) {
        var fromFragments = fromUrl.substr(commonPrefix.length).replace(/^\/+/, '').replace(/[^\/]+$/, '').split('/'),
            toFragments = toUrl.substr(commonPrefix.length).replace(/^\/+/, '').split('/');

        fromFragments.pop();

        var i = 0;
        while (i < fromFragments.length && i < toFragments.length && fromFragments[i] === toFragments[i]) {
            i += 1;
        }
        var relativeUrl = toFragments.slice(i).join('/');
        while (i < fromFragments.length) {
            relativeUrl = '../' + relativeUrl;
            i += 1;
        }
        return relativeUrl;
    } else {
        return toUrl; // No dice
    }
};

exports.buildRootRelativeUrl = function (fromUrl, toUrl, rootUrl) {
    var commonPrefix = exports.getCommonPrefix(fromUrl, toUrl);
    if (commonPrefix) {
        var isBelowRootUrl = rootUrl && toUrl.indexOf(rootUrl) === 0;
        if (isBelowRootUrl) {
            return '/' + exports.buildRelativeUrl(rootUrl, toUrl);
        } else {
            return '/' + exports.buildRelativeUrl(commonPrefix, toUrl);
        }
    } else {
        return toUrl;
    }
};

// AKA schema-relative
exports.buildProtocolRelativeUrl = function (fromUrl, toUrl) {
    return toUrl.replace(/^[a-z]+:/, '');
};

exports.findCommonUrlPrefix = function (urls) {
    if (!Array.isArray(urls)) {
        urls = Array.prototype.slice.apply(arguments);
    }

    var commonPathSegments = [];
    var length = Infinity;

    // Split the urls into segments
    // Note the shortests length of segments, as this will be the biggest common prefix maximum length anyway
    var splitUrls = urls.map(function (url) {
        var segments = url.split('/');

        length = Math.min(length, segments.length);
        return segments;
    });

    var segment;
    // Compare each segment of each url in order
    for (var i = 0; i < length; i += 1) {
        segment = splitUrls[0][i];

        // Every segment at the same index must be equal
        if (splitUrls.every(function (segments) {
            return segments[i] === segment;
        })) {
            commonPathSegments.push(segment);
        } else {
            break;
        }
    }

    // For online protocols we require a hostname
    if (['http:', 'https:', 'ftp:'].indexOf(commonPathSegments[0]) !== -1) {
        if (commonPathSegments.length < 3) {
            // No hostname, no common prefix
            return '';
        }
    }

    if (commonPathSegments[0] === 'file:' && commonPathSegments.length < 3) {
        // This is probably the root of the file system. Add another slash
        commonPathSegments.push('');
    }

    return commonPathSegments.join('/');
};

exports.urlOrFsPathToUrl = function (urlOrFsPath, ensureTrailingSlash) {
    var url;
    if (!urlOrFsPath) {
        url = exports.fsFilePathToFileUrl(process.cwd());
    } else if (!/^[a-z0-9\+]+:/.test(urlOrFsPath)) { // No protocol, assume local file system path
        url = exports.fsFilePathToFileUrl(urlOrFsPath);
    } else {
        url = urlOrFsPath;
    }
    if (ensureTrailingSlash) {
        return exports.ensureTrailingSlash(url);
    } else {
        return url;
    }
};

exports.ensureTrailingSlash = function (url) {
    return url.replace(/([^\/])(\?|\#|$)/, '$1/$2');
};

exports.fileUrlToFsPath = function (fileUrl) {
    fileUrl = fileUrl.replace(/[?#].*$/, ''); // Strip query string and fragment identifier
    return decodeURI(fileUrl).substr((process.platform === 'win32' ? 'file:///' : 'file://').length).replace(/[#\?].*$/, '');
};

exports.fsFilePathToFileUrl = function (fsFilePath) {
    if (fsFilePath[0] === '/') {
        return 'file://' + encodeURI(fsFilePath);
    } else {
        // Interpret as relative to the current working dir
        fsFilePath = Path.resolve(process.cwd(), fsFilePath);
        if (process.platform === 'win32') {
            return 'file:///' + encodeURI(fsFilePath.replace(/\\/g, '/'));
        } else {
            return 'file://' + encodeURI(fsFilePath);
        }
    }
};

// Wrapper around fsFilePathToFileUrl that makes sure that the resulting file: url ends in a slash.
// Url.resolve misbehaves if they don't (how would it know to do otherwise?)
exports.fsDirToFileUrl = function (fsDir) {
    var url = exports.fsFilePathToFileUrl(fsDir);
    return (/\/$/).test(url) ? url : url + '/';
};

exports.makeFileUrlMatcher = function () {
    var matchers = _.flatten(arguments).map(function (fsPattern) {
        fsPattern = String(fsPattern);
        if (!/^\//.test(fsPattern)) {
            fsPattern = Path.join(process.cwd(), fsPattern);
        }
        return function (url) {
            return (/^file:/).test(url) && glob.fnmatch(fsPattern, exports.fileUrlToFsPath(url));
        };
    });
    if (matchers.length === 1) {
        return matchers[0];
    } else {
        return function (url) {
            for (var i = 0 ; i < matchers.length ; i += 1) {
                if (matchers[i](url)) {
                    return true;
                }
            }
            return false;
        };
    }
};

exports.parse = Url.parse;

var protocolRe = /^([a-z0-9]+:)/i;

exports.resolveUrl = function (sourceUrl, relativeUrl) {
    // As of 90802d6 node's Url.resolve normalizes the resolved url so e.g. "ext:Ext Base" gets
    // mangled to "ext:ext". Until a better solution is found, only use Url.resolve to resolve Urls
    // that don't have a protocol:
    if (protocolRe.test(relativeUrl)) {
        // Absolute
        return relativeUrl;
    } else {
        if (/^\/\//.test(relativeUrl)) {
            var matchSourceUrlHttpOrHttpsProtocol = sourceUrl.match(/^(https?:)/);
            if (matchSourceUrlHttpOrHttpsProtocol) {
                return matchSourceUrlHttpOrHttpsProtocol[1] + relativeUrl;
            } else {
                return 'http:' + relativeUrl;
            }
        } else {
            return Url.resolve(sourceUrl, relativeUrl);
        }
    }
};
