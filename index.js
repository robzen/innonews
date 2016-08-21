require("babel-polyfill");
import Koa from 'koa';
import send from 'koa-send';
import News from './news';
import ImageUtils from './image-utils';
import User from './user';

const app = new Koa();
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

//user handling
app.use(async (ctx, next) => {
    let ip = ctx.headers['host'].split(':')[0];
    let userAgent = ctx.headers['user-agent'];

    //TODO: apply settings provided via GET ?source=spiegel&update=5

    ctx.state.user = await getUser(ipUsers, ip, userAgent);

    await next();
});

//serving images
app.use(async ctx => {
    //update news images if updateInterval time is reached
    let updateInterval = ctx.state.user.getSettings().updateMinutes;
    let lastUpdate = ctx.state.user.getLastUpdate();
    if(lastUpdate + updateInterval*60*1000 <= Date.now()) {
        await getNewsImages(ctx.state.user);
    }

    await send(ctx, ctx.state.user.getNextImage());
});

//start server
app.listen(3000);
console.log('listening on port '+port);


const getUser = async (users, ip, userAgent) => {
    for(let i=0; i<users.length; i++) {
        let existingUser = users[i];

        if(existingUser.getIp() === ip) { return existingUser; }
    }

    let newUser = new User(ip, userAgent);
    users.push(newUser);
    await getNewsImages(newUser);
    console.log(`new user registered: IP: ${ip}, Innovaphone Version: ${newUser.getInnovaphoneVersion()}`);

    return newUser;
};

const getNewsImages = async user => {
    console.log('updating images for user: '+user.getIp());

    return new Promise((resolve, reject) => {
        news.get(user.getSettings().newsSource, 'top').then(newsResponse => {
            let displaySize = user.getDisplaySize();

            user.setLastUpdate(Date.now());
            user.resetImages();

            newsResponse.articles.forEach(function(article, i) {
                if(article.urlToImage != null) { //only articles with images
                    imageUtils.download(article.urlToImage, `images/${user.getIp()}/${i}`)
                        .then(fileName => {
                            //console.log(`image ${i} downloaded.`);
                            return imageUtils.edit(fileName, displaySize.width, displaySize.height, article.title);
                        })
                        .then((imgFile, promiseError) => {
                            if(promiseError) {
                                console.log('error while getting image', err);
                            } else {
                                //console.log(`image ${imgFile} edited.`);
                                user.addImage(imgFile);
                            }

                            //check if done
                            if(i+1 >= newsResponse.articles.length) {
                                resolve();
                            }
                        });
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