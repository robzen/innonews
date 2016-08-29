'use strict';

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
                    var contentType = response.headers['content-type'];
                    if (contentType) {
                        (function () {
                            //extract extension from header and use it for the filename
                            var extension = function () {
                                var rawFileType = contentType.split('/')[1]; //can contain stuff like ;charset=UTF-8
                                return rawFileType.split(';')[0]; //extracts image extension only -> jpeg
                            }();
                            var fileNameWithExtension = fileName + '.' + extension;

                            createNeededFolders(fileName)
                                .then(function () {
                                    //save as image
                                    fs.writeFile(fileNameWithExtension, body, 'binary', function (err) {
                                        if (err) {
                                            reject('error while writing file: ' + err);
                                        } else {
                                            resolve(fileNameWithExtension);
                                        }
                                    });
                                })
                                .catch(function (err) {
                                    reject('error while creating necessary folders: ' + err);
                            });
                        })();
                    } else {
                        reject('no content-type in header!');
                    }
                })();
            }
        });
    });
};

ImageUtils.prototype.edit = function (imgFile, width, height, paddingBottom, text) {
    var txtPadding = 3;
    var backgroundImgFileName = 'bg.png';

    return new Promise(function (resolve, reject) {
        Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(function (font) {
            var textLines = countLines(font, width, text);
            var textHeight = textLines * font.common.lineHeight;

            return Jimp.read(backgroundImgFileName).then(function (bgImg) {
                return bgImg.crop(0, 0, width, height);
            }).then(function (croppedBg) {
                Jimp.read(imgFile).then(function (newsImg) {
                    return newsImg.cover(width, height - paddingBottom - textHeight - txtPadding, Jimp.VERTICAL_ALIGN_TOP);
                }).then(function (coveredNewsImg) {
                    return croppedBg.composite(coveredNewsImg, 0, 0);
                }).then(function (finalImage) {
                    return finalImage.print(font, txtPadding, height - textHeight - paddingBottom, text, width);
                }).then(function (printedImage) {
                    printedImage.write(imgFile);
                    resolve(imgFile);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }).catch(function (err) {
            reject(err);
        });
    });
};

/*ImageUtils.prototype.getErrorImage = (width, height) => {
 const errorImgFileName = 'error.png';

 return new Promise((resolve, reject) => {
 Jimp.read(errorImgFileName)
 .then(errorImg => {
 return errorImg.resize(width, height);
 }).then(resizedErrImg => {
 resizedErrImg.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
 if(err) {
 reject(err);
 } else {
 resolve(buffer);
 }
 });
 }).catch(err => {
 reject(err);
 })
 });
 };*/

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

function countLines(font, maxWidth, text) {
    var words = text.split(' ');
    var line = '',
        lines = 1;

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var testWidth = measureText(font, testLine);
        if (testWidth > maxWidth && n > 0) {
            line = words[n] + ' ';
            ++lines;
        } else {
            line = testLine;
        }
    }

    return lines;

    function measureText(font, text) {
        var x = 0;
        for (var i = 0; i < text.length; i++) {
            if (font.chars[text[i]]) {
                x += font.chars[text[i]].xoffset + (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0) + (font.chars[text[i]].xadvance || 0);
            }
        }
        return x;
    }
}

module.exports = ImageUtils;

//# sourceMappingURL=image-utils.js.map