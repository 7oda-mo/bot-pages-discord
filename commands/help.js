const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض قائمة بجميع الأوامر مع شرحها'),
    async execute(interaction) {
        const developerId = config.developer;
        
        // جلب معلومات المستخدم المطور
        const developer = await interaction.client.users.fetch(developerId);
        // جمع قائمة الأوامر
        const commandsList = interaction.client.commands.map(command => {
            return {
                name: command.data.name,
                description: command.data.description,
            };
        });

        // بناء الرسالة المضمنة
      const embed = new EmbedBuilder()

    .setTitle('قائمة الأوامر')
    .setDescription('هذه قائمة بجميع الأوامر المتاحة مع شرح لكل منها')
    .setFooter({ text: `تم برمجة هذا البوت بواسطة ${developer.tag}`, iconURL: developer.displayAvatarURL() });

        // إضافة الأوامر والشرح إلى الرسالة المضمنة
    commandsList.forEach(command => {

    embed.addFields({ name: `/${command.name}`, value: command.description });

});
        // إرسال الرد مع الرسالة المضمنة
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};