# Musicbot
24x7 Radio music bot for Discord

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fkb24x7%2Fmusicbot&envs=TOKEN&TOKENDesc=Your+Bot+Token)

To start the music bot locally:
1. Make a new file `.env` with the bot token format as: 
```
TOKEN=YOUR_TOKEN_HERE
```
2. Run `yarn`, if you don't have yarn, install it using `npm -g install yarn`
3. Run `node index.js` to start the bot

#### Commands:
1. $help: Shows all the commands
2. $play url/search for a video: Plays a YouTube video
3. $stop / $leave: Stops playing music in your server
4. $trending: Plays a top trending video from YouTube
