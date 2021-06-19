import Discord from 'discord.js'
import ytdl from 'ytdl-core'


const getInfo = async (args, message) => {
    const info = await ytdl.getInfo(args)
    if (info.videoDetails.isLive) {
        const liveEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Sorry, Live videos are not supported yet.')
        if (message) {
            message.reply(liveEmbed)
        }
    }
    const formats = info.formats
    const audios = []
    formats.forEach((format) => {
        if (!format.hasVideo && format.container === 'webm') {
            audios.push(format.url)
        }
    })
    const url = audios[0] ? audios[0] : ''
    return url
}

export default getInfo