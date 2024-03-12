# bot-page-discord
PageManagerBot is a bot that provides commands for managing pages, sharing code snippets, and sending instant messages on Discord.


## Features

- The ability to manage pages easily through commands.
- Ability to share codes and create embedded messages.
- Simple and easy to use user interface.

## Available Commands

1. **/deletepage**: Short description of deletepage command.
   - `/deletepage`: Execute deletepage command.

2. **/addpage**: Short description of addpage command.
   - `/addpage`: Execute addpage command.

3. **/pages**: Short description of pages command.
   - `/pages`: Execute pages command.

4. **/share-code**: Short description of share-code command.
   - `/share-code`: Execute share-code command.

5. **/embed**: Short description of embed command.
   - `/embed channel`: Execute embed command.

6. **/send-message**: Short description of send-message command.
   - `/send-message`: Execute send-message command.

7. **/help**: Short description of help command.
   - `/help`: Execute help command.

## Installation and Usage

1. Download the bot to your local machine.
2. Install all dependencies using npm:


   npm install
   ```

3. Configure the `config.json` file with your own values:

   ```json
   {
     "token": "YOUR_DISCORD_BOT_TOKEN",
     "guildId": "YOUR_DISCORD_GUILD_ID",
     "clientId": "YOUR_DISCORD_CLIENT_ID"
   }
   ```

4. Run the bot using the command:

   ```
   node index.js
   ```

5. You can now use the available commands in your Discord server.

## Dependencies

- [discord.js](https://discord.js.org/) - Discord API library for JavaScript.
- [cli-table3](https://www.npmjs.com/package/cli-table3) - For creating tables in the console.

## Contribution

If you would like to contribute to the development of this bot, feel free to open a Pull Request or report an Issue in the bot's repository.

## License

This bot is distributed under the [MIT License](https://opensource.org/licenses/MIT).
```
