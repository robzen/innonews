require("babel-polyfill");
const Jimp = require('jimp');
const request = require('request');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

function ImageUtils() {}

ImageUtils.prototype.download = (imageUrl, fileName) => {
    return new Promise((resolve, reject) => {
        request.get({url: imageUrl, encoding: 'binary'}, (err, response, body) => {
            if (err) {
                reject(err);
            } else {
                let contentType = response.headers['content-type'];
                if (contentType) {
                    //extract extension from header and use it for the filename
                    const extension = contentType.split('/')[1];
                    const fileNameWithExtension = fileName + '.' + extension;

                    createNeededFolders(fileName)
                        .then(() => {
                            //save as image
                            fs.writeFile(fileNameWithExtension, body, 'binary', err => {
                                if (err) {
                                    reject('error while writing file: ' + err);
                                } else {
                                    resolve(fileNameWithExtension);
                                }
                            });
                        })
                        .catch(err => {
                            reject('error while creating necessary folders: ' + err);
                        });
                } else {
                    reject('no content-type in header!');
                }
            }
        });
    });
};

ImageUtils.prototype.edit = (imgFile, width, height, paddingBottom, text) => {
    const txtPadding = 3;
    const backgroundImgFileName = 'txtBg.png';

    return new Promise((resolve, reject) => {
        Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
            .then(font => {
                const textLines = countLines(font, width, text);
                const textHeight = textLines * font.common.lineHeight;

                return Jimp.read(imgFile)
                    .then(img => {
                        //resize the image
                        img.cover(width, height - paddingBottom/*, Jimp.VERTICAL_ALIGN_TOP*/).quality(100);
                        return img;
                    })
                    .then(img => {
                        //add background image at the bottom
                        return Jimp.read(backgroundImgFileName)
                            .then((txtBgImg) => {
                                return img.composite(txtBgImg, -3/*for seamless pattern*/, height - textHeight - paddingBottom - txtPadding * 2);
                            });
                    })
                    .then(img => {
                        //write text into the image
                        return img.print(font, txtPadding, height - textHeight - paddingBottom - txtPadding, text, width);
                    })
                    .then(img => {
                        //save edited image
                        img.write(imgFile);
                        resolve(imgFile);
                    });
            }).catch(err => {
            reject(err);
        });


    });
};

function createNeededFolders(filePath) {
    return new Promise((resolve, reject) => {
        //cuts the filename so you only have the folder path
        const parsedPath = path.parse(filePath);

        //creates necessary folders
        mkdirp(parsedPath.dir, err => {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    });
}

function countLines(font, maxWidth, text) {
    const words = text.split(' ');
    let line = '', lines = 1;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let testWidth = measureText(font, testLine);
        if (testWidth > maxWidth && n > 0) {
            line = words[n] + ' ';
            ++lines;
        } else {
            line = testLine;
        }
    }

    return lines;

    function measureText(font, text) {
        let x = 0;
        for (let i = 0; i < text.length; i++) {
            if (font.chars[text[i]]) {
                x += font.chars[text[i]].xoffset
                    + (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0)
                    + (font.chars[text[i]].xadvance || 0);
            }
        }
        return x;
    }
}

module.exports = ImageUtils;