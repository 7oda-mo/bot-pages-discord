const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data.db");

const allowedUserIds = ["1016128744819265618", "1190305586710073427"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletepage")
    .setDescription("Delete a page from the database."),
  async execute(interaction) {
    const userId = interaction.user.id;

    if (!allowedUserIds.includes(userId)) {
      await interaction.reply({
        content: "ليس لديك الإذن لاستخدام هذا الأمر.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    db.all(`SELECT title FROM pages`, async (err, rows) => {
      if (err) {
        console.error(err.message);
        await interaction.followUp({
          content: "حدث خطأ أثناء جلب قائمة الصفحات.",
          ephemeral: true,
        });
        return;
      }

      if (rows.length === 0) {
        await interaction.followUp({
          content: "لا توجد صفحات لحذفها.",
          ephemeral: true,
        });
        return;
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_page")
        .setPlaceholder("اختر صفحة لحذفها")
        .addOptions(
          rows.map((row) => ({ label: row.title, value: row.title }))
        );

      await interaction.editReply({
        content: "يرجى اختيار الصفحة التي ترغب في حذفها:",
        components: [new ActionRowBuilder().addComponents(selectMenu)],
      });
    });
  },

  async handleSelectMenu(interaction) {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    const selectedPage = interaction.values[0];

    await db.run(
      `DELETE FROM pages WHERE title = ?`,
      selectedPage,
      async (err) => {
        if (err) {
          console.error(err.message);
          await interaction.followUp({
            content: "حدث خطأ أثناء حذف الصفحة.",
            ephemeral: true,
          });
          return;
        }

        await interaction.followUp({
          content: `تم حذف الصفحة "${selectedPage}" بنجاح.`,
          ephemeral: true,
        });
      }
    );
  },
};