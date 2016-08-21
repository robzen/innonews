'use strict';

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

ImageUtils.prototype.edit = function (imgFile, width, height, text) {
    var txtPadding = 6,
        fontSize = 16;
    var textHeight = text.length * fontSize / width * fontSize;
    var backgroundImgFileName = 'txtBg.png';

    return new Promise(function (resolve, reject) {
        Jimp.read(imgFile).then(function (img) {
            //resize the image
            img.cover(width, height).quality(100);
            return img;
        }).then(function (img) {
            //add background image at the bottom
            return Jimp.read(backgroundImgFileName).then(function (txtBgImg) {
                return img.composite(txtBgImg, 0, height - textHeight);
            });
        }).then(function (img) {
            //write text into the image
            //if the font gets changed don't forget to change the fontSize const too
            return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(function (font) {
                img.print(font, txtPadding, height - textHeight + txtPadding, text, width - txtPadding);
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

//# sourceMappingURL=image-utils-compiled.js.map