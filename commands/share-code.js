const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sharecode')
        .setDescription('شارك قطعة من الكود مع المستخدمين')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('الكود البرمجي')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('version')
                .setDescription('الإصدار (v12/v13/v14)')
                .addChoice('v12', 'v12')
                .addChoice('v13', 'v13')
                .addChoice('v14', 'v14')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('اسم الكود')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('وصف الكود')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('نوع الكود (js أو py)')
                .addChoice('JavaScript', 'Discord.js')
                .addChoice('Python', 'Discord.py')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('القناة التي تريد المشاركة فيها')),
    async execute(interaction) {
        const code = interaction.options.getString('code');
        const version = interaction.options.getString('version');
        const name = interaction.options.getString('name');
        const description = interaction.options.getString('description');
        const type = interaction.options.getString('type');
        let targetChannel;

        // Check if channel option is specified
        const channelOption = interaction.options.getChannel('channel');
        if (channelOption) {
            targetChannel = channelOption;
            await interaction.reply(`تم أرسال الكود في القناة <#${targetChannel.id}>. شكراً على المشاركة.`);
        } else {
            targetChannel = interaction.channel;
            await interaction.reply(`تم أرسال الكود في القناة الحالية. شكراً على المشاركة.`);
        }

        // Set icon URL based on code type
        let iconUrl;
        if (type === 'Discord.js') {
            iconUrl = 'https://cdn3.emoji.gg/emojis/8727-javascript.png';
        } else if (type === 'Discord.py') {
            iconUrl = 'https://cdn3.emoji.gg/emojis/7065-python.png';
        }

        const developerId = config.developer;

        // Fetch developer information
        const developer = await interaction.client.users.fetch(developerId);

        // Create the embed
        const embed = new MessageEmbed()
            .setDescription('```js\n' + code + '```')
            .setAuthor(`${type} Code`, iconUrl)
            .addFields(
                { name: '💡 Name', value: `> ${name}` },
                { name: '📃 Description', value: `> ${description}` },
                { name: '💎 Type', value: `> ${type}` },
                { name: '🧪 Version', value: `> ${version}` },
                { name: '👑 Shared by', value: `> <@${interaction.user.id}>` },
                { name: '⏰️ Time', value: `> <t:${Math.floor(Date.now() / 1000)}:R>` }
            )
            .setFooter(`تم برمجة هذا البوت بواسطة ${developer.tag}`, developer.displayAvatarURL());

        // Create a button for sending the code
        const sendButton = new MessageButton()
            .setCustomId('send_button')
            .setLabel('Send')
            .setStyle('PRIMARY');

        // Create a row for the button
        const row = new MessageActionRow()
            .addComponents(sendButton);

        // Send the embed with the button to the target channel
        await targetChannel.send({ embeds: [embed], components: [row] });

        // Handle button interactions
        const filter = i => i.customId === 'send_button';
        const collector = targetChannel.createMessageComponentCollector({ filter });

        collector.on('collect', async (i) => {
            const codeContent = `هذا هو الكود :\n\`\`\`js\n${code}\`\`\``;
            try {
                await i.user.send({ content: codeContent });
                await i.reply({ content: 'تم إرسال الرمز إلي رسائلك الخاصة.', ephemeral: true });
            } catch (error) {
                console.error('حدثت مشكلة أثناء إرسال الكود في الرسائل الخاصة:', error);
                await i.reply({ content: 'حدثت مشكلة أثناء إرسال الرمز في الرسائل الخاصة.', ephemeral: true });
            }
        });
    },
};