function User(ip, userAgent) {
    let lastUpdate = 0;
    let settings = {
        newsSource: 'the-verge',
        newsSortBy: 'latest',
        updateMinutes: 10
    };
    let imageFolder = {
        activeIndex: 0,
        files: []
    };

    const innovaphoneVersion = (userAgent => {
        let innovaphoneVersionRegex = /^innovaphone-(.+)\//;
        let regexArr = innovaphoneVersionRegex.exec(userAgent);

        if(regexArr && regexArr.length >= 2) {
            return regexArr[1];
        } else {
            return 'unknown';
        }
    })(userAgent);

    const displaySettings = (innovaphoneVersion => {
        switch(innovaphoneVersion) {
            case 'IP111':
            case 'IP222':
            case 'IP241':
                return { width: 320, height: 240, paddingBottom: 40 };
            case 'IP232':
                return { width: 480, height: 272, paddingBottom: 40 };
        }

        return { width: 400, height: 300, paddingBottom: 0 };
    })(innovaphoneVersion);

    this.getIp = () => { return ip; };
    this.getInnovaphoneVersion = () => { return innovaphoneVersion; };
    this.getDisplaySettings = () => { return displaySettings; };
    this.getLastUpdate = () => { return lastUpdate; };
    this.setLastUpdate = timestamp => { lastUpdate = timestamp };
    this.getSettings = () => { return settings; };

    this.setSettings = s => {
        if(s.newsSource) settings.newsSource = s.newsSource;
        if(s.newsSortBy) settings.newsSortBy = s.newsSortBy;
        if(s.updateMinutes) settings.updateMinutes = s.updateMinutes;
    };

    this.resetImages = () => {
        imageFolder.files = [];
        imageFolder.activeIndex = 0;
    };

    this.addImage = imageFile => {
        imageFolder.files.push(imageFile);
    };

    this.getNextImage = () => {
        let nextImage = 'error.png'; //TODO: passendes error bild für innovaphone display

        if(imageFolder.files.length > 0) {
            nextImage = imageFolder.files[imageFolder.activeIndex];
            imageFolder.activeIndex = ++imageFolder.activeIndex % imageFolder.files.length;
        }

        return nextImage;
    };
}

module.exports = User;