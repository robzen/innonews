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

//user handling
app.use(function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
        var ip, userAgent;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        ip = ctx.request.ip.replace(/\W/g, '-');
                        userAgent = ctx.headers['user-agent'];

                        //TODO: apply settings provided via GET ?source=spiegel&sortBy=top&update=5

                        _context2.next = 4;
                        return getUser(ipUsers, ip, userAgent);

                    case 4:
                        ctx.state.user = _context2.sent;
                        _context2.next = 7;
                        return next();

                    case 7:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}());

app.use(router.routes());

router.get('/', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(ctx, next) {
        var updateInterval, lastUpdate;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return (0, _koaSend2.default)(ctx, ctx.state.user.getNextImage());

                    case 2:

                        //update news images if updateInterval time is reached
                        updateInterval = ctx.state.user.getSettings().updateMinutes;
                        lastUpdate = ctx.state.user.getLastUpdate();

                        if (lastUpdate + updateInterval * 60 * 1000 <= Date.now()) {
                            getNewsImages(ctx.state.user);
                        }

                    case 5:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
}());

//start server
app.listen(3000);
console.log('listening on port ' + port);

var getUser = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(users, ip, userAgent) {
        var i, existingUser, newUser;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        i = 0;

                    case 1:
                        if (!(i < users.length)) {
                            _context4.next = 8;
                            break;
                        }

                        existingUser = users[i];

                        if (!(existingUser.getIp() === ip)) {
                            _context4.next = 5;
                            break;
                        }

                        return _context4.abrupt('return', existingUser);

                    case 5:
                        i++;
                        _context4.next = 1;
                        break;

                    case 8:

                        //register new user and download news images
                        newUser = new _user2.default(ip, userAgent);

                        users.push(newUser);
                        console.log('new user registered: IP: ' + ip + ', Innovaphone Version: ' + newUser.getInnovaphoneVersion());
                        _context4.next = 13;
                        return getNewsImages(newUser);

                    case 13:
                        return _context4.abrupt('return', newUser);

                    case 14:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function getUser(_x7, _x8, _x9) {
        return _ref4.apply(this, arguments);
    };
}();

var getNewsImages = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(user) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        console.log('updating images for user: ' + user.getIp());

                        return _context5.abrupt('return', new Promise(function (resolve, reject) {
                            news.get(user.getSettings().newsSource, user.getSettings().newsSortBy).then(function (newsResponse) {
                                var displaySettings = user.getDisplaySettings();

                                user.setLastUpdate(Date.now());
                                user.resetImages();

                                newsResponse.articles.forEach(function (article, i) {
                                    if (article.urlToImage != null) {
                                        //only articles with images
                                        imageUtils.download(article.urlToImage, 'images/' + user.getIp() + '/' + i).then(function (fileName) {
                                            //console.log(`image ${i} downloaded.`);
                                            return imageUtils.edit(fileName, displaySettings.width, displaySettings.height, displaySettings.paddingBottom, article.title);
                                        }).then(function (imgFile, promiseError) {
                                            if (promiseError) {
                                                console.log('error while getting image', err);
                                            } else {
                                                console.log('image ' + imgFile + ' added.');
                                                user.addImage(imgFile);
                                            }

                                            //check if done
                                            if (i + 1 >= newsResponse.articles.length) {
                                                resolve();
                                            }
                                        }).catch(function (err) {
                                            reject('error while downloading news: ' + err);
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
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function getNewsImages(_x10) {
        return _ref5.apply(this, arguments);
    };
}();

//# sourceMappingURL=index.js.map