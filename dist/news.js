'use strict';

var request = require('request');

var API_KEY = 'b6d5a008ad5443758ea6997487b04ee6';

function News() {}

News.prototype.get = function (source, sortBy) {
    source = source || 'spiegel-online';
    sortBy = sortBy || 'latest';

    return new Promise(function (resolve, reject) {
        request.get({
            url: 'https://newsapi.org/v1/articles?source=' + source + '&apiKey=' + API_KEY + '&sortBy=' + sortBy,
            json: true
        }, function (err, response, body) {
            resolve(body);
        }).on('error', function (err) {
            reject(err);
        });
    });
};

module.exports = News;

//# sourceMappingURL=news.js.map