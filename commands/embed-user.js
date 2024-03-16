const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { checkPermissions } = require("./permissions/permissions");
//const { developer } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send-message")
    .setDescription("يرسل رسالة Embed مخصصة لمستخدم محدد.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("المستخدم الذي سيتم إرسال الرسالة إليه.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("عنوان الرسالة.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("وصف الرسالة.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("image").setDescription("صورة الرسالة.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("لون الرسالة.")
        .addChoice("أخضر", "#00FF00")
        .addChoice("رمادي", "#808080")
        .addChoice("أحمر", "#FF0000")
        .addChoice("أزرق", "#0000FF")
        .addChoice("أسود", "#000000")
        .addChoice("أبيض", "#FFFFFF")
        .addChoice("أصفر", "#FFFF00")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("المؤلف للرسالة.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("رابط الرسالة.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("الصورة المصغرة للرسالة.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("نص القدم للرسالة.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("footer-image")
        .setDescription("صورة القدم للرسالة. يعمل فقط إذا كان هناك قدم بالفعل.")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    if (!(await checkPermissions(interaction))) return;

    const targetUser = interaction.options.getUser("user");
    const title = interaction.options.getString("title") || "هذا ايمبد تجريبي";
    const description =
      interaction.options.getString("description") || "هذا ايمبد تجريبي";
    const image = interaction.options.getString("image");
    const color = interaction.options.getString("color") || Math.floor(Math.random()*16777215);
    const author = interaction.options.getString("author");
    const url = interaction.options.getString("url");
    const thumbnail = interaction.options.getString("thumbnail");
    const footer = interaction.options.getString("footer");
    const footerImage = interaction.options.getString("footer-image");

    try {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setImage(image)
        .setColor(color)
        .setAuthor({name: author, url: url})
        .setThumbnail(thumbnail)
        .setFooter(footer, footerImage);

      await interaction.reply({
        content: "تم انشاء رسالة الايمبد✅",
        ephemeral: true,
      });
      await targetUser.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "حدث خطأ أثناء إنشاء الايمبد ❌",
        ephemeral: true,
      });
    }
  },
};
