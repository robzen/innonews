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
            if(err) {
                reject(err);
            } else {
                //extract extension from header and use it for the filename
                let extension = response.headers['content-type'].split('/')[1];
                let fileNameWithExtension = fileName + '.' + extension;

                createNeededFolders(fileName)
                    .then(() => {
                        //save as image
                        fs.writeFile(fileNameWithExtension, body, 'binary', err => {
                            if(err) {
                                reject('error while writing file: '+err);
                            } else {
                                resolve(fileNameWithExtension);
                            }
                        });
                    })
                    .catch(err => {
                        reject('error while creating necessary folders: '+err);
                    });
            }
        });
    });
};

ImageUtils.prototype.edit = (imgFile, width, height, paddingBottom, text) => {
    const txtPadding = 6, fontSize = 16;
    const textHeight = ((text.length * fontSize) / width) * fontSize + txtPadding;
    const backgroundImgFileName = 'txtBg.png';

    return new Promise((resolve, reject) => {
        Jimp.read(imgFile)
            .then(img => {
                //resize the image
                img.cover(width, height, Jimp.VERTICAL_ALIGN_TOP).quality(100);
                return img;
            })
            .then(img => {
                //add background image at the bottom
                return Jimp.read(backgroundImgFileName)
                    .then((txtBgImg) => {
                        return img.composite(txtBgImg, 0, height - textHeight - paddingBottom);
                    });
            })
            .then(img => {
                //write text into the image
                //if the font gets changed don't forget to change the fontSize const too
                return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
                    .then(font => {
                        img.print(font, txtPadding, height - textHeight - paddingBottom + txtPadding, text, width - txtPadding);
                        return img;
                    });
            })
            .then(img => {
                //save edited image
                img.write(imgFile);
                resolve(imgFile);
            })
            .catch(err => {
                reject(err);
            })
    });
};

ImageUtils.prototype.deleteImages = async imageFolder => {
    return new Promise((resolve, reject) => {
        fs.readdir(imageFolder, (err, files) => {
            if(err) {
                reject('error while deleting images: '+err);
            } else {
                if(files.length <= 0) {
                    resolve(0);
                } else {
                    files.forEach((fileName, i) => {
                        fs.unlink(imageFolder+'/'+fileName, err => {
                            if(err) { console.log('could not delete file '+fileName); }
                        });

                        if(i+1 >= files.length) {
                            resolve(files.length);
                        }
                    });
                }
            }
        });
    });
};

function createNeededFolders(filePath) {
    return new Promise((resolve, reject) => {
        //cuts the filename so you only have the folder path
        let parsedPath = path.parse(filePath);

        //creates necessary folders
        mkdirp(parsedPath.dir, err => {
            if(err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    });
}

module.exports = ImageUtils;