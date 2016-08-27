# innonews
View news on your innovaphone display

<img align="center" src="http://i.imgur.com/GDTpDZ7.png" />


#### Usage
Use this URL in your innovaphone background config
```
http://<machine>/news/[newsSource[/sortBy[/updateIntervalInMinutes]]?refresh=<secondsTillRequestNextImage>
```

[Available News Sources and their supported sortings](https://newsapi.org/sources)

#### Some Examples:
```
//View top news of google. Change image everey 20 seconds
http://MYSERVER:3000/news/google-news/top/?refresh=20

//View latest news of The Verge. Update images every 10 minutes. Change image everey 30 seconds
http://MYSERVER:3000/news/the-verge/latest/10/?refresh=30
```