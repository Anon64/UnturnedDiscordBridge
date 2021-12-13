const Discord = require('discord.js');
const fs = require('fs');

const config = require('./config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
let bridgeChannel;

function wait(ms) { //not used??
    return new Promise(r => {
        setTimeout(r, ms);
    });
}

const pipePrefix = process.platform === 'win32' ? "\\\\.\\pipe\\" : "/var/tmp/";

client.once('ready', async () => {
    bridgeChannel = await client.channels.fetch(config.bridgeChannel);
    bridgeChannel.send("Starting Node Server...");
    console.log(`Logging in as ${client.user.tag}`);

    const wstream = fs.createWriteStream(pipePrefix + config.NodetoCSPipe, { flags: 'r+' });
    client.on('message', async m => {
        if (m.author.id == client.user.id) return;
        try {
            let data = { User: m.member.displayName || m.member.nickname || m.author.username, Message: m.cleanContent, Color: m.member.displayHexColor.toUpperCase() };
            wstream.cork();
            wstream.write(JSON.stringify(data) + '\n');
            process.nextTick(() => wstream.uncork());
        } catch (e) {
            console.log(e);
        }
    });

    const fd = fs.openSync(pipePrefix + config.CStoNodePipe, 'r+');
    const stream = fs.createReadStream(null, { fd });

    stream.on('data', async (d) => {
        let line = d.toString();
        let event;
        try {
            event = JSON.parse(line);
        } catch (e) {
            return;
        }
        if (!event.hasOwnProperty("type")) return;
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
        stream.destroy();
        wstream.destroy();
        await bridgeChannel.send("Stopping Node Server!");
        process.kill(process.pid, 'SIGTERM');
        process.exit(0);
    }

    process.on('SIGINT', handleShutdown);
});


client.login(config.token);
