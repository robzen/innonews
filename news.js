const request = require('request');

const API_KEY = 'b6d5a008ad5443758ea6997487b04ee6';

function News() {
}

News.prototype.get = (source, sortBy) => {
    source = source || 'google-news';
    sortBy = sortBy || '';

    return new Promise((resolve, reject) => {
        request.get({
            url: `https://newsapi.org/v1/articles?source=${source}&apiKey=${API_KEY}&sortBy=${sortBy}`,
            json: true
        }, (err, response, body) => {
            resolve(body);
        })
               .on('error', err => {
                   reject(err);
               });
    })
};

module.exports = News;