import Discord from 'discord.js'
import getVideoInfo from './videoInfo.js'
import helpEmbed from './help.js'
import searchInfo from './search.js'
import trending from './trending.js'
import dotenv from 'dotenv'
import getInfo from './getUrl.js'
import fs from 'fs'

const client = new Discord.Client()

client.on('ready', async () => {
    console.log("I'm ready")
    client.user.setActivity(`Music 24x7 🎸`, {
        type: "PLAYING"
    })
})

const randomTimeGen = () => {
    return Math.floor(Math.random() * (15000 - 3000) + 3000)
}

const executeLoop = async (play) => {
    fs.readdir('./json', (err, files) => {
        if (files[0]) {
            files.forEach(guildId => {
                if (guildId.match(".json$", "i")) {
                    fs.readFile(`./json/${guildId}`, async (err, data) => {
                        if (err) throw err;
                        const guildData = JSON.parse(data);
                        const channel = await client.channels.cache.get(guildData.channel)
                        channel.leave()
                        const connections = await client.voice.connections
                        const connectionIds = []
                        connections.forEach((connection) => {
                            connectionIds.push(connection.channel.id)
                        })
                        if (!connectionIds.includes(channel.id)) {
                            play(guildData.url, channel, false, channel.bitrate)
                        }
                    })
                }
            })
        }
        if (err) throw err
    })
}

client.on('message', async (message) => {
    let messageContent = message.content.toLowerCase()
    if (message.author.bot) return
    if (messageContent.startsWith('$play') && message.member.voice.channel) {

        const playMusic = async () => {
            try {
                message.channel.startTyping()
                setTimeout(() => message.channel.stopTyping(), 10000)
                const args = message.content.split(' ').slice(1).join(" ")
                const regexp = /(?:.+?)?(?:\/v\/|watch\/|\?v=|\&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/;

                if (regexp.test(args)) {
                    const executeURL = async (argument, execChannel, reply, bit) => {
                        const audio = await getInfo(argument, message)
                        if (audio) {
                            const channel = execChannel ? execChannel : message.member.voice.channel
                            const connection = await channel.join();
                            const dispatcher = connection.play(audio, {
                                bitrate: message.member.voice.channel.bitrate ? message.member.voice.channel.bitrate : bit
                            })
                            dispatcher.on('start', () => getVideoInfo(args, message, reply))
                            dispatcher.on('finish', () => {
                                setTimeout(() => {
                                    executeLoop(executeURL)
                                }, randomTimeGen())
                            })
                        }
                    }
                    executeURL(args, message.member.voice.channel, true)
                    fs.writeFileSync(`./json/${message.guild.id}.json`, JSON.stringify({
                        channel: message.member.voice.channel.id,
                        url: args
                    }))
                } else {
                    const url = await searchInfo(args, message, true)
                    const executeURL = async (argument, execChannel, reply, bit) => {
                        const audio = await getInfo(argument, message)
                        if (audio) {
                            const channel = execChannel ? execChannel : message.member.voice.channel
                            const connection = await channel.join();
                            const dispatcher = connection.play(audio, {
                                bitrate: message.member.voice.channel.bitrate ? message.member.voice.channel.bitrate : bit
                            })
                            dispatcher.on('finish', () => {
                                setTimeout(() => {
                                    executeLoop(executeURL)
                                }, randomTimeGen())
                            })
                        }
                    }
                    executeURL(url, message.member.voice.channel)
                    fs.writeFileSync(`./json/${message.guild.id}.json`, JSON.stringify({
                        channel: message.member.voice.channel.id,
                        url: url
                    }))
                }
            } catch (e) {
                console.log(e)
            }
        }

        playMusic()

    } else if ((messageContent.startsWith('$stop') || messageContent.startsWith('$leave')) && message.member.voice.channel) {
        try {
            message.member.voice.channel.leave()
            const leaveEmbed = new Discord.MessageEmbed()
                .setTitle('Now leaving your Voice Channel')
                .setColor('RANDOM')
            message.reply(leaveEmbed)
        } catch (e) {
            console.log(e)
            const leaveEmbed = new Discord.MessageEmbed()
                .setTitle("There was an error, I don't think I'm in your voice channel.")
                .setColor('RED')
            message.reply(leaveEmbed)
        }
    } else if (messageContent === '$help') {
        message.reply(helpEmbed())
    } else if (messageContent === '$trending' && message.member.voice.channel) {
        try {
            message.channel.startTyping()
            setTimeout(() => message.channel.stopTyping(), 10000)
            const connection = await message.member.voice.channel.join()
            const url = await trending(message)
            const audio = await getInfo(url, message)
            if (audio) {
                const dispatcher = connection.play(audio, {
                    bitrate: message.member.voice.channel.bitrate
                })
                dispatcher.on('finish', () => {
                    message.member.voice.channel.leave()
                })
            }
        } catch (e) {
            console.log(e)
        }
    }
})

const envFile = dotenv.config()

if (envFile.TOKEN) {
    client.login(envFile.TOKEN)
} else {
    client.login(process.env.TOKEN)
}

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
})