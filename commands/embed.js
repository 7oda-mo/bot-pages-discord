const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { checkPermissions } = require("./permissions/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Embed builder.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the bot will send the embed.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The embed title.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The embed description.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("The embed image.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("The embed color.")
        .addChoice("Green", "#00FF00")
        .addChoice("Gray", "#808080")
        .addChoice("Red", "#FF0000")
        .addChoice("Blue", "#0000FF")
        .addChoice("Black", "#000000")
        .addChoice("White", "#FFFFFF")
        .addChoice("Yellow", "#FFFF00")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("The embed author.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("The embed URL.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("The embed thumbnail.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("The embed footer.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer-image")
        .setDescription(
          "The embed footer image. Only works if there is already a footer."
        )
        .setRequired(false)
    ),
  async execute(interaction, client) {
    if (!(await checkPermissions(interaction))) return;
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;
    const title = interaction.options.getString("title") || "هذا ايمبد تجريبي";
    const description =
      interaction.options.getString("description") || "هذا ايمبد تجريبي";
    const image = interaction.options.getString("image");
    const color = interaction.options.getString("color") || "RANDOM";
    const author = interaction.options.getString("author");
    const url = interaction.options.getString("url");
    const thumbnail = interaction.options.getString("thumbnail");
    const footer = interaction.options.getString("footer");
    const footerImage = interaction.options.getString("footer-image");

    try {
      const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .setImage(image)
        .setColor(color)
        .setAuthor(author, url)
        .setThumbnail(thumbnail)
        .setFooter(footer, footerImage);

      await interaction.reply({
        content: "تم انشاء رسالة الايمبد✅",
        ephemeral: true,
      });
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "حدث خطأ أثناء إنشاء الايمبد ❌",
        ephemeral: true,
      });
    }
  },
};
