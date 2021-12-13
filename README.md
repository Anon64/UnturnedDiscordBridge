# UnturnedDiscordBridge
A node.js server to work with the [UnturnedDiscordBridge](https://www.nuget.org/packages/UnturnedDiscordBridge/) plugin.
I wrote this program for a small discord server of mine, this may not work for you!

Edit the config.yaml file in `plugins/Anon64.UnturnedDiscordBridge/config.yaml` to change pipe names if you'd like.

## How to use
1. Download zip
2. Extract to folder
3. Edit `config.json`
4. Run the server (`node index.js`)

## How to use on Windows 
Same steps as above but in `config.json` change
```json
    "CStoNodePipe": "/var/tmp/CS2N.pipe",
    "NodetoCSPipe": "/var/tmp/N2CS.pipe"
```
to
```json
    "CStoNodePipe": "\\\\.\\pipe\\CS2N.pipe",
    "NodetoCSPipe": "\\\\.\\pipe\\N2CS.pipe"
```
