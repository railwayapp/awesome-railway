import Discord from 'discord.js'
import { YouTube } from 'youtube-sr'

const searchInfo = async (args, message, reply) => {
    const search = await YouTube.search(args, { limit: 1 })
    const video = search[0]
    if (video && reply) {
        const title = video.title
        const thumbnail = video.thumbnail.url
        const embed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Now Playing on an infinite loop')
            .setDescription(title)
            .setImage(thumbnail)
        message.reply(embed)
        message.channel.stopTyping()
    } else if (!video) {
        const notFoundEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle('No results found for this video')
        message.reply(notFoundEmbed)
        message.channel.stopTyping()
    }
    const url = `https://www.youtube.com/watch?v=${video?.id ? video?.id : 'dQw4w9WgXcQ'}`
    return url
}

export default searchInfo