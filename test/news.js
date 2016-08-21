const News = require('../news');
const expect = require('chai').expect;

var news;

before(() => {
    news = new News();
});

describe('news module', () => {
    describe('downloading news', () => {
       it('should return a json object', () => {
            news.get()
                .then((json) => {
                    expect(json).to.be.a('object');
                })
       });
    });
});