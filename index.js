const Discord = require('discord.js');
const fs = require('fs');

const config = require('./config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
let bridgeChannel;

//pardon this bad code
client.once('ready', async () => {
    bridgeChannel = await client.channels.fetch(config.bridgeChannel);
    bridgeChannel.send("Starting Node Server...");
    console.log(`Logging in as ${client.user.tag}`);

    await bridgeChannel.send("Connected to Unturned Server!");

    const wstream = fs.createWriteStream('/var/tmp/UDB.sock');
    client.on('message', m => {
        if (m.author.id == client.user.id) return;
        try {
            let data = { User: m.member.displayName || m.member.nickname || m.author.username, Message: m.cleanContent, Color: m.member.displayHexColor };
            wstream.write(JSON.stringify(data) + '\n');
        } catch (e) {
            console.log(e);
        }
    });

    const fd = fs.openSync('/var/tmp/UDB.sock', 'r+');
    const stream = fs.createReadStream(null, { fd });
    stream.on('data', async (d) => {
        console.log(`data: ${d.toString()}`)
        let event;
        try {
            event = JSON.parse(d);
        } catch (e) {
        }
        switch (event.type) {
            case "join":
                await bridgeChannel.send(`**${event.user} joined the game**`);
                break;
            case "leave":
                await bridgeChannel.send(`**${event.user} left the game**`);
                break;
            case "message":
                await bridgeChannel.send(`**${event.user}**: ${event.message}`);
                break;
            case "death":
                await bridgeChannel.send(`**${event.user} died**`);
                break;
        }
    });

    async function handleShutdown() {
        stream.close();
        stream.destroy();
        wstream.close();
        wstream.destroy();
        await bridgeChannel.send("Stopping Node Server!");
        process.exit(0);
    }
    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
});


client.login(config.token);
