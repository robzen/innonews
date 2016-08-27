require("babel-polyfill");
import Koa from 'koa';
import send from 'koa-send';
import Router from 'koa-router';
import News from './news';
import ImageUtils from './image-utils';
import User from './user';

const app = new Koa();
const router = new Router();
const news = new News();
const imageUtils = new ImageUtils();

const port = 3000;
const ipUsers = [];

//error handling
app.use(async (ctx, next) => {
	try {
		await next();
	} catch(err) {
		ctx.body = { message: err.message };
		ctx.status = err.status || 500;
	}
});

app.use(router.routes());

router.get('/:newsSource?/:newsSortBy?/:updateMinutes?', async (ctx) => {
    //TODO: update images if settings have changed + change settings for existing users
    //user handling
    let ip = ctx.request.ip.replace(/\W/g, '-');
    let userAgent = ctx.headers['user-agent'];
    console.log(`request: ${userAgent} - newsSource:${ctx.params.newsSource}, newsSortBy:${ctx.params.newsSortBy}, updateMinutes:${ctx.params.updateMinutes}`);
    ctx.state.user = await getUser(ipUsers, ip, userAgent, {
        newsSource: ctx.params.newsSource,
        newsSortBy: ctx.params.newsSortBy,
        updateMinutes: ctx.params.updateMinutes
    });

    await send(ctx, ctx.state.user.getNextImage());

    //update news images if updateInterval time is reached
    let updateInterval = ctx.state.user.getSettings().updateMinutes;
    let lastUpdate = ctx.state.user.getLastUpdate();
    if(lastUpdate + updateInterval*60*1000 <= Date.now()) {
        getNewsImages(ctx.state.user);
    }
});

//start server
app.listen(port);
console.log('listening on port '+port);

const getUser = async (users, ip, userAgent, givenSettings) => {
    for(let i=0; i<users.length; i++) {
        let existingUser = users[i];

        if(existingUser.getIp() === ip) { return existingUser; }
    }

    //register new user and download news images
    let newUser = new User(ip, userAgent);
    newUser.setSettings(givenSettings);
    users.push(newUser);
    console.log(`new user registered: IP: ${ip}, Innovaphone Version: ${newUser.getInnovaphoneVersion()}, Settings: ${JSON.stringify(newUser.getSettings())}`);
    await getNewsImages(newUser);

    return newUser;
};

const getNewsImages = async user => {
    console.log('updating images for user: '+user.getIp());

    return new Promise((resolve, reject) => {
        news.get(user.getSettings().newsSource, user.getSettings().newsSortBy).then(newsResponse => {
            let displaySettings = user.getDisplaySettings();

            user.setLastUpdate(Date.now());
            user.resetImages();

            newsResponse.articles.forEach(function(article, i) {
                if(article.urlToImage != null) { //only articles with images
                    imageUtils.download(article.urlToImage, `images/${user.getIp()}/${i}`)
                        .then(fileName => {
                            //console.log(`image ${i} downloaded.`);
                            return imageUtils.edit(fileName, displaySettings.width, displaySettings.height, displaySettings.paddingBottom, article.title);
                        })
                        .then((imgFile, promiseError) => {
                            if(promiseError) {
                                console.log('error while getting image', err);
                            } else {
                                console.log(`image ${imgFile} added.`);
                                user.addImage(imgFile);
                            }

                            //check if done
                            if(i+1 >= newsResponse.articles.length) {
                                resolve();
                            }
                        }).catch(err => {
                            reject('error while downloading news: '+err);
                        })
                } else {
                    //check if done
                    if(i+1 >= newsResponse.articles.length) {
                        resolve();
                    }
                }
            });
        }).catch(err => {
            reject('error while getting news: '+err);
        });
    });
};