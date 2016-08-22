'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");
var Jimp = require('jimp');
var request = require('request');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function ImageUtils() {}

ImageUtils.prototype.download = function (imageUrl, fileName) {
    return new Promise(function (resolve, reject) {
        request.get({ url: imageUrl, encoding: 'binary' }, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                (function () {
                    //extract extension from header and use it for the filename
                    var extension = response.headers['content-type'].split('/')[1];
                    var fileNameWithExtension = fileName + '.' + extension;

                    createNeededFolders(fileName).then(function () {
                        //save as image
                        fs.writeFile(fileNameWithExtension, body, 'binary', function (err) {
                            if (err) {
                                reject('error while writing file: ' + err);
                            } else {
                                resolve(fileNameWithExtension);
                            }
                        });
                    }).catch(function (err) {
                        reject('error while creating necessary folders: ' + err);
                    });
                })();
            }
        });
    });
};

ImageUtils.prototype.edit = function (imgFile, width, height, paddingBottom, text) {
    var txtPadding = 6,
        fontSize = 16;
    var textHeight = text.length * fontSize / width * fontSize + txtPadding;
    var backgroundImgFileName = 'txtBg.png';

    return new Promise(function (resolve, reject) {
        Jimp.read(imgFile).then(function (img) {
            //resize the image
            img.cover(width, height, Jimp.VERTICAL_ALIGN_TOP).quality(100);
            return img;
        }).then(function (img) {
            //add background image at the bottom
            return Jimp.read(backgroundImgFileName).then(function (txtBgImg) {
                return img.composite(txtBgImg, 0, height - textHeight - paddingBottom);
            });
        }).then(function (img) {
            //write text into the image
            //if the font gets changed don't forget to change the fontSize const too
            return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(function (font) {
                img.print(font, txtPadding, height - textHeight - paddingBottom + txtPadding, text, width - txtPadding);
                return img;
            });
        }).then(function (img) {
            //save edited image
            img.write(imgFile);
            resolve(imgFile);
        }).catch(function (err) {
            reject(err);
        });
    });
};

ImageUtils.prototype.deleteImages = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(imageFolder) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', new Promise(function (resolve, reject) {
                            fs.readdir(imageFolder, function (err, files) {
                                if (err) {
                                    reject('error while deleting images: ' + err);
                                } else {
                                    if (files.length <= 0) {
                                        resolve(0);
                                    } else {
                                        files.forEach(function (fileName, i) {
                                            fs.unlink(imageFolder + '/' + fileName, function (err) {
                                                if (err) {
                                                    console.log('could not delete file ' + fileName);
                                                }
                                            });

                                            if (i + 1 >= files.length) {
                                                resolve(files.length);
                                            }
                                        });
                                    }
                                }
                            });
                        }));

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}();

function createNeededFolders(filePath) {
    return new Promise(function (resolve, reject) {
        //cuts the filename so you only have the folder path
        var parsedPath = path.parse(filePath);

        //creates necessary folders
        mkdirp(parsedPath.dir, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    });
}

module.exports = ImageUtils;

//# sourceMappingURL=image-utils.js.map