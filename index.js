// استيراد الحزم والمكتبات الضرورية
const { Client, Partials, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const Table = require("cli-table3");

// تهيئة متغيرات البيئة مثل الرموز ومعرف الخادم ومعرف العميل
const { token } = require("./config.json");

// إنشاء عميل Discord وتهيئته
const client = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "GuildPresences",
    "GuildVoiceStates",
    "DirectMessages",
  ],
  partials: [
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.Message,
  ]
});

client.commands = new Collection();

// تجميع ملفات الأوامر وتحميلها في الذاكرة وتحويلها إلى صيغة JSON
const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// تهيئة واستخدام خدمة REST لإدارة الأوامر في Discord
const rest = new REST({ version: "10" }).setToken(token);

// معالجة حدث "ready" حيث يتم تنفيذ العمليات التي يجب القيام بها عندما يكون البوت جاهزًا
client.once("ready", async () => {
  await client.application.fetch();
  const application = await client.application.fetch();
  const owner = application.owner;

  client.user.setStatus("online");
  client.user.setActivity("egyxo", { type: "PLAYING" });

  try {
    // Fetch the existing application commands
    const existingCommands = await rest.get(
      Routes.applicationCommands(client.user.id)
    );

    // Filter out the commands that are not in the local file
    const localCommandNames = commandFiles.map((file) =>
      require(`./commands/${file}`).data.name
    );
    const commandsToDelete = existingCommands.filter(
      (command) => !localCommandNames.includes(command.name)
    );

    // Delete the non-existing commands
    for (const command of commandsToDelete) {
      await rest.delete(
        Routes.applicationCommand(client.user.id, command.id)
      );
      console.log(`Deleted command ${command.name}`);
    }

    // Register/update the commands from the local file
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    // Create and print a table with bot information
    const table = new Table({
      head: ["Event", "Status"],
      style: { head: ["green"] },
      colWidths: [40, 25],
    });
    table.push(
      ["Bot is ready", "✅"],
      ["Started refreshing application commands", "✅"],
      ["Successfully reloaded application commands", "✅"],
      ["Number of Commands", client.commands.size],
      ["Bot Name", client.user.username],
      ["Bot ID", client.user.id],
      ["Bot Tag", client.user.tag],
      ["Bot Creation Date", client.user.createdAt.toLocaleDateString()],
      ["Bot Owner", owner.username]
    );
    console.log(table.toString());
  } catch (error) {
    console.error(error);
  }
});

// معالجة حدث "interactionCreate" للتعامل مع التفاعلات مثل الأوامر والقوائم المنسدلة
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId === "select_page") {
    require("./commands/deletepage").handleSelectMenu(interaction);
  }
});

// معالجة حدث "interactionCreate" لتنفيذ الأوامر
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "حدث خطأ أثناء تنفيذ الأمر.",
      ephemeral: true,
    });
  }
});

// إنشاء قاعدة بيانات SQLite وتحديثها إذا لزم الأمر
const db = new sqlite3.Database("./data.db");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS pages (id INTEGER Primary KEY AUTOINCREMENT, title TEXT, description TEXT, features TEXT, version TEXT, src TEXT, date TEXT, image_url TEXT)"
  );
});
db.close();
console.log("SQLite database created successfully.");

// تسجيل البوت في Discord باستخدام معرف البوت ومفتاح الوصول
client.login(token);
