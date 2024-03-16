const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data.db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pages")
    .setDescription("عرض الصفحات."),
  async execute(interaction) {
    const pages = [];

    db.all("SELECT * FROM pages", async (err, rows) => {
      if (err) {
        console.error(err.message);
        return;
      }

      if (rows.length === 0) {
        await interaction.reply({
          content: "لا توجد صفحات متاحة حاليا.",
        });
        return;
      }

      rows.forEach((row) => {
        const embed = new EmbedBuilder()
          .setTitle(`📄 ${row.title}`)
          .setDescription(row.description)
          .addFields(
            { name: "🔍 Features:", value: `> ${row.features || "N/A"}` },
            { name: "🔖 Version:", value: `> ${row.version || "N/A"}` },
            { name: "📝 Source:", value: `> ${row.src || "N/A"}` },
            { name: "🗓️ Date:", value: `> ${row.date || "N/A"}` }
          )
          .setImage(row.image_url || "")
          .setFooter({ text: `Page: 1/${rows.length}` })
          .setColor("#0BDA51"); // Discord Blue color

        pages.push({ embed, source: row.src });
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous_button")
          .setLabel("⬅️")
          .setStyle("Primary"),
        new ButtonBuilder()
          .setCustomId("next_button")
          .setLabel("➡️")
          .setStyle("Primary"),
        new ButtonBuilder()
          .setCustomId("send_button")
          .setLabel("📨")
          .setStyle("Primary")
      );

      if (!interaction.replied) {
        await interaction.reply({
          embeds: [pages[0].embed],
          components: [row],
        });

        let currentPage = 0;

        const filter = () => true;
        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          time: null,
        });

        collector.on("collect", async (i) => {
          if (i.customId === "previous_button") {
            currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
          } else if (i.customId === "next_button") {
            currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
          } else if (i.customId === "send_button") {
            const user = interaction.user;
            const currentPageData = pages[currentPage];
            if (currentPageData && currentPageData.source) {
              await user.send({
                content: `Here is the source for the current page:\n${currentPageData.source}`,
                ephemeral: true,
              });
              await interaction.followUp({
                content: "تم إرسال السورس في الخاص.",
                ephemeral: true,
              });
            }
          }

          const embed = pages[currentPage].embed;
          if (embed && !embed.footer) {
            embed.setFooter({
              text: `Page: ${currentPage + 1}/${pages.length}`,
            });
          }

          await i.update({
            embeds: [embed],
            components: [row],
          });
        });

        collector.on("end", async (collected) => {
          const msg = await interaction.fetchReply();
          if (msg && msg.edit) {
            await msg.edit({ components: [] }).catch((error) => {
              console.error("Failed to clear components:", error);
              writeToLogFile(
                "An error occurred while processing interaction: " + error
              );
            });
          } else {
            console.error("Error: Invalid or missing msg object.");
          }
        });
      }
    });
  },
};
