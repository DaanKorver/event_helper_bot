const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json")
let creatingEvent = false;
let eventObj = {
    title: "",
    author: "",
    date: "",
    desc: "",
    channelID: ""
}

client.on('ready', ()=> {
    console.log("Connected as" + client.user.tag);
    client.user.setActivity("Events", {type: "WATCHING"})
})

client.on('message', (msg)=>{
    if(msg.author == client.user) {
        return
    }
    if(msg.content.startsWith("!")) {
        processCommand(msg)
    }
})

function processCommand(msg) {
    let fullCommand = msg.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)
    if(msg.channel.type == 'dm') {
        return
    }
    msg.delete()

    switch(primaryCommand) {
        case "help": {
            help(msg, arguments)
            break;
        }
        case "createevent": {
            createEvent(msg, arguments)
        }
    }
}

function help(msg, arguments) {
    if(arguments.length == 0) {
        msg.channel.send("Hier komt die help dinges")
    } else {
        msg.channel.send("Huh, arugmenten bij het hulp commando, ben je niet goed snik ofzo? Probeer `!help` voor meer info")
    }
}

function createEvent(msg, arguments) {
    eventObj.author = msg.author.username
    creatingEvent = true
    if(arguments.length == 0) {
        msg.author.send("Event Setup:\n" +
        "Als je `cancel` typt dan zal ik stoppen met het maken van het event, dit kan wanneer je wilt.\n\n" +
        "Voer de naam van het event in:")
    } else {
        // msg.channel.send("Huh, arugmenten bij het hulp commando, ben je niet goed snik ofzo? Probeer `!help` voor meer info")
    }
}

let eventStep = 0;
let currentChannelSet = false;

function resetAll(msg, afgerond) {
    if(!afgerond) {
        msg.channel.send("ABC ik kap ermee");
    }
    eventStep = 0;
    eventObj.channelID = 0;
    currentChannelSet = false;
    creatingEvent = false;
}


client.on("message", (msg) => {
    if(msg.author == client.user) {
        return
    }
    if(!currentChannelSet && msg.channel.type == 'text') {
        eventObj.channelID = msg.channel.id;
        currentChannelSet = true;
    }
    if(msg.channel.type == 'dm' && creatingEvent) {
        processEvent(eventStep, msg);
    }
})

function processEvent(step, msg) {
    if(msg.content == "cancel") {
        resetAll(msg, false)
        return
    }
    switch(step) {
        case 0: {
            eventObj.title = msg.content;
            msg.channel.send("Voer de datum in (DD-MM-YYYY):")
            break;
        }
        case 1: {
            let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
            for(let i = 0; i < alphabet.length; i++) {
                if(msg.content.includes(alphabet[i])) {
                    msg.channel.send("Oei, het datum format is niet goed, probeert het opnieuw");
                    return
                }
            }
            if(msg.content.charAt(2) == "-" && msg.content.charAt(5) == "-") {
                eventObj.date = msg.content;
                msg.channel.send("Wat is de beschrijving voor het event?")
            } else {
                msg.channel.send("Oei, het datum format is niet goed, probeert het opnieuw");
                return
            }
            break;
        }
        case 2: {
            eventObj.desc = msg.content;
            msg.channel.send("Dit zijn jou ingevoerde values:\n" +
            "**Titel**: " + eventObj.title + "\n" +
            "**Datum**: " +eventObj.date + "\n" +
            "**Beschrijving**: " +eventObj.desc + "\n\n" +
            "Ga je hiermee akkoord? `ja / nee`")
            break;
        }
        case 3: {
            if(msg.content.toLowerCase() == "ja") {
                msg.channel.send("Aangemaakt a niffo!")
                let embed = {
                    color: 0x0099ff,
                    title: "Titel: " + eventObj.title,
                    author : {
                        name: "Gemaakt door: " + eventObj.author
                    },
                    description: eventObj.desc,
                    fields: [
                        {
                            name: "Aantal: 0",
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: eventObj.date,
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: 'Aanwezig',
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: 'Afwezig',
                            value: '\u200b',
                            inline: true
                        }
                    ]
                }
                let newEmbed = {
                    color: 0x0099ff,
                    title: eventObj.title,
                    author : {
                        name: "Gemaakt door: " + eventObj.author
                    },
                    description: eventObj.desc,
                    fields: [
                        {
                            name: "Aantal: 0",
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: eventObj.date,
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: 'Aanwezig',
                            value: '\u200b',
                            inline: true
                        },
                        {
                            name: 'Afwezig',
                            value: '\u200b',
                            inline: true
                        }
                    ]
                }
                let aanwezig = []
                let afwezig = []
                client.channels.cache.get(eventObj.channelID).send({embed: embed}).then(embedMessage => {
                    embedMessage.react("✅")
                    embedMessage.react("❌")

                    embedMessage.awaitReactions((reaction, user) => {
                        if(!user.bot) {
                            //Remove Reaction
                            client.on('messageReactionRemove', (reaction, user)=>{
                                newEmbed.fields[3].value = "\u200b"
                                newEmbed.fields[4].value = "\u200b"
                                if(reaction.emoji.name == "✅") {
                                    for(let i = 0; i < aanwezig.length; i++) {
                                        if(aanwezig[i] == user.username) {
                                            aanwezig.splice(i, 1)
                                        }
                                    }
                                } else if (reaction.emoji.name == "❌") {
                                    for(let i = 0; i < afwezig.length; i++) {
                                        if(afwezig[i] == user.username) {
                                            afwezig.splice(i, 1)
                                        }
                                    }
                                } else {
                                    return
                                }
                                for(let i = 0; i < aanwezig.length; i++) {
                                    newEmbed.fields[3].value += aanwezig[i] + "\n"
                                }
                                for(let i = 0; i < afwezig.length; i++) {
                                    newEmbed.fields[4].value += afwezig[i] + "\n"
                                }
                                newEmbed.fields[0].name = "Aantal: " + (aanwezig.length + afwezig.length)
                                embedMessage.edit({embed: newEmbed})
                            })
                            //Add reaction
                            if(reaction.emoji.name == "✅") {
                                for(let i = 0; i < afwezig.length; i++) {
                                    if(afwezig[i] == user.username) {
                                        afwezig.splice(i, 1)
                                    }
                                }
                                if(!aanwezig.includes(user.username)) {
                                    aanwezig.push(user.username)
                                }
                                
                            } else if(reaction.emoji.name == "❌") {
                                for(let i = 0; i < aanwezig.length; i++) {
                                    if(aanwezig[i] == user.username) {
                                        aanwezig.splice(i, 1)
                                    }
                                }
                                if(!afwezig.includes(user.username)) {
                                    afwezig.push(user.username)
                                }
                            } else {
                                return
                            }
                            newEmbed.fields[0].name = "Aantal: " + (aanwezig.length + afwezig.length)
                            newEmbed.fields[3].value = "\u200b"
                            newEmbed.fields[4].value = "\u200b"
                            for(let i = 0; i < aanwezig.length; i++) {
                                newEmbed.fields[3].value += aanwezig[i] + "\n"
                            }
                            for(let i = 0; i < afwezig.length; i++) {
                                newEmbed.fields[4].value += afwezig[i] + "\n"
                            }
                            embedMessage.edit({embed: newEmbed})
                        }
                    })
                })
               
                resetAll(msg, true)
                return
            } else if(msg.content.toLowerCase() == "nee"){
                resetAll(msg, false)
                return
            } else {
                msg.channel.send("Daar kan ik niks mee. `ja / nee`")
                return
            }
        }
    }
    eventStep++;
}

client.login(config.token)