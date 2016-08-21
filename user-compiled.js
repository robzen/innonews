'use strict';

function User(ip, userAgent) {
    var lastUpdate = 0;
    var settings = {
        newsSource: 'spiegel-online',
        updateMinutes: 10
    };
    var imageFolder = {
        activeIndex: 0,
        files: []
    };

    var innovaphoneVersion = function (userAgent) {
        var innovaphoneVersionRegex = /^innovaphone-(.+)\//;
        var regexArr = innovaphoneVersionRegex.exec(userAgent);

        if (regexArr && regexArr.length >= 2) {
            return regexArr[1];
        } else {
            return 'unknown';
        }
    }(userAgent);

    var displaySize = function (innovaphoneVersion) {
        switch (innovaphoneVersion) {
            case 'IP111':
            case 'IP222':
            case 'IP241':
                return { width: 320, height: 240 };
            case 'IP232':
                return { width: 480, height: 272 };
        }

        return { width: 400, height: 300 };
    }(innovaphoneVersion);

    this.getIp = function () {
        return ip;
    };
    this.getInnovaphoneVersion = function () {
        return innovaphoneVersion;
    };
    this.getDisplaySize = function () {
        return displaySize;
    };
    this.getLastUpdate = function () {
        return lastUpdate;
    };
    this.setLastUpdate = function (timestamp) {
        lastUpdate = timestamp;
    };
    this.getSettings = function () {
        return settings;
    };

    this.setSettings = function (s) {
        if (s.newsSource) settings.newsSource = s.newsSource;
        if (s.updateMinutes) settings.updateMinutes = s.updateMinutes;
    };

    this.resetImages = function () {
        imageFolder.files = [];
        imageFolder.activeIndex = 0;
    };

    this.addImage = function (imageFile) {
        imageFolder.files.push(imageFile);
    };

    this.getNextImage = function () {
        var nextImage = 'error.png'; //TODO: passendes error bild für innovaphone display

        if (imageFolder.files.length > 0) {
            nextImage = imageFolder.files[imageFolder.activeIndex];
            imageFolder.activeIndex = ++imageFolder.activeIndex % imageFolder.files.length;
        }

        return nextImage;
    };
}

module.exports = User;

//# sourceMappingURL=user-compiled.js.map