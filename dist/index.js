'use strict';

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaSend = require('koa-send');

var _koaSend2 = _interopRequireDefault(_koaSend);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _news = require('./news');

var _news2 = _interopRequireDefault(_news);

var _imageUtils = require('./image-utils');

var _imageUtils2 = _interopRequireDefault(_imageUtils);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");


var app = new _koa2.default();
var router = new _koaRouter2.default();
var news = new _news2.default();
var imageUtils = new _imageUtils2.default();

var port = 3000;
var ipUsers = [];

//error handling
app.use(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return next();

                    case 3:
                        _context.next = 9;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context['catch'](0);

                        ctx.body = { message: _context.t0.message };
                        ctx.status = _context.t0.status || 500;

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[0, 5]]);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

app.use(router.routes());

router.get('/news/:newsSource?/:newsSortBy?/:updateMinutes?', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx) {
        var ip, userAgent, updateInterval, lastUpdate;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        //user handling
                        ip = ctx.request.ip.replace(/\W/g, '-');
                        userAgent = ctx.headers['user-agent'];

                        console.log('request: ' + userAgent + ' - newsSource: ' + (ctx.params.newsSource || '-') + ', newsSortBy: ' + (ctx.params.newsSortBy || '-') + ', updateMinutes: ' + (ctx.params.updateMinutes || '-'));
                        _context2.next = 5;
                        return getUser(ipUsers, ip, userAgent, {
                            newsSource: ctx.params.newsSource,
                            newsSortBy: ctx.params.newsSortBy,
                            updateMinutes: ctx.params.updateMinutes
                        });

                    case 5:
                        ctx.state.user = _context2.sent;

                        if (!(ctx.state.user.getLastQuery() !== ctx.request.url)) {
                            _context2.next = 10;
                            break;
                        }

                        _context2.next = 9;
                        return getNewsImages(ctx.state.user);

                    case 9:
                        ctx.state.user.setLastQuery(ctx.request.url);

                    case 10:

                        //update news images in the background if updateInterval time is reached
                        updateInterval = ctx.state.user.getSettings().updateMinutes;
                        lastUpdate = ctx.state.user.getLastUpdate();

                        if (lastUpdate + updateInterval * 60 * 1000 <= Date.now()) {
                            getNewsImages(ctx.state.user);
                        }

                        _context2.next = 15;
                        return (0, _koaSend2.default)(ctx, ctx.state.user.getNextImage());

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function (_x3) {
        return _ref2.apply(this, arguments);
    };
}());

//start server
app.listen(port);
console.log('listening on port ' + port);

var getUser = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(users, ip, userAgent, givenSettings) {
        var i, existingUser, newUser;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < users.length)) {
                            _context3.next = 9;
                            break;
                        }

                        existingUser = users[i];

                        if (!(existingUser.getIp() === ip)) {
                            _context3.next = 6;
                            break;
                        }

                        existingUser.setSettings(givenSettings);
                        return _context3.abrupt('return', existingUser);

                    case 6:
                        i++;
                        _context3.next = 1;
                        break;

                    case 9:

                        //register new user and download news images
                        newUser = new _user2.default(ip, userAgent);

                        newUser.setSettings(givenSettings);
                        users.push(newUser);
                        console.log('new user registered: IP: ' + ip + ', Innovaphone Version: ' + newUser.getInnovaphoneVersion() + ', Settings: ' + JSON.stringify(newUser.getSettings()));

                        return _context3.abrupt('return', newUser);

                    case 14:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function getUser(_x4, _x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}();

var getNewsImages = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(user) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        console.log('updating images for user: ' + user.getIp());

                        return _context4.abrupt('return', new Promise(function (resolve, reject) {
                            news.get(user.getSettings().newsSource, user.getSettings().newsSortBy).then(function (newsResponse) {
                                var displaySettings = user.getDisplaySettings();

                                user.setLastUpdate(Date.now());
                                user.resetImages();

                                newsResponse.articles.forEach(function (article, i) {
                                    if (article.urlToImage != null) {
                                        //only articles with images
                                        imageUtils.download(article.urlToImage, 'images/' + user.getIp() + '/' + user.getSettings().newsSource + '_' + i).then(function (fileName) {
                                            //console.log(`image ${i} downloaded.`);
                                            imageUtils.edit(fileName, displaySettings.width, displaySettings.height, displaySettings.paddingBottom, article.title).then(function (imgFile) {
                                                return imgFile;
                                            }).then(function (imgFile) {
                                                console.log('image ' + imgFile + ' added.');
                                                user.addImage(imgFile);

                                                //check if done
                                                if (i + 1 >= newsResponse.articles.length) {
                                                    resolve();
                                                }
                                            }).catch(function (err) {
                                                console.log('error while editing image', err);

                                                //check if done
                                                if (i + 1 >= newsResponse.articles.length) {
                                                    resolve();
                                                }
                                            });
                                        }).catch(function (err) {
                                            console.log('error while donwloading image', err);

                                            //check if done
                                            if (i + 1 >= newsResponse.articles.length) {
                                                resolve();
                                            }
                                        });
                                    } else {
                                        //check if done
                                        if (i + 1 >= newsResponse.articles.length) {
                                            resolve();
                                        }
                                    }
                                });
                            }).catch(function (err) {
                                reject('error while getting news: ' + err);
                            });
                        }));

                    case 2:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function getNewsImages(_x8) {
        return _ref4.apply(this, arguments);
    };
}();

//# sourceMappingURL=index.js.map