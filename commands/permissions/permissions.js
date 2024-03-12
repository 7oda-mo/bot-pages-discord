const { Permissions } = require("discord.js");
const { developer } = require("../../config.json");

async function checkPermissions(interaction) {
  if (
    !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
    interaction.user.id !== developer
  ) {
    await interaction.reply({
      content: "لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.",
      ephemeral: true,
    });
    return false; // لا تمتلك الصلاحيات اللازمة
  }
  return true; // تمتلك الصلاحيات اللازمة
}

module.exports = { checkPermissions };
