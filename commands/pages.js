const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pages')
        .setDescription('عرض الصفحات.'),
    async execute(interaction) {
        const pages = [];

        db.all("SELECT * FROM pages", (err, rows) => {
            if (err) {
                console.error(err.message);
                return;
            }

            if (rows.length === 0) {
                interaction.reply('لا توجد صفحات متاحة حاليا.');
                return;
            }

            rows.forEach(row => {
                const embed = new MessageEmbed()
                    .setTitle(`📄 ${row.title}`)
                    .setDescription(row.description)
                    .addFields(
                        { name: '🔍 Features:', value: `> ${row.features || 'N/A'}` },
                        { name: '🔖 Version:', value: `> ${row.version || 'N/A'}` },
                        { name: '📝 Source:', value: `> ${row.src || 'N/A'}` },
                        { name: '🗓️ Date:', value: `> ${row.date || 'N/A'}` }
                    )
                    .setImage(row.image_url || '')
                    .setFooter({ text: `Page: 1/${rows.length}` })
                    .setColor('#0BDA51'); // Discord Blue color

                pages.push(embed);
            });

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('previous_button')
                        .setLabel('⬅️')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('next_button')
                        .setLabel('➡️')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('send_button')
                        .setLabel('📨')
                        .setStyle('PRIMARY')
                );

            if (!interaction.replied) {
                interaction.reply({ embeds: [pages[0]], components: [row] }).then(msg => {
                    let currentPage = 0;

                    const filter = () => true;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: null });

                    collector.on('collect', async i => {
                        if (i.customId === 'previous_button') {
                            currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
                        } else if (i.customId === 'next_button') {
                            currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
                        } else if (i.customId === 'send_button') {
                            const user = interaction.user;
                            const pageContent = pages[currentPage].fields.find(field => field.name === '📝 Source:').value;
                            await user.send(`Here is the source for the current page:\n${pageContent}`);
                        }

              
                            await i.update({ embeds: [pages[currentPage].setFooter({ text: `Page: ${currentPage + 1}/${pages.length}` })] });
                        
                    });

                    collector.on('end', collected => {
                        if (msg && msg.edit) {
                            msg.edit({ components: [] }).catch(error => {
                                console.error('Failed to clear components:', error);
                              writeToLogFile('An error occurred while processing interaction: ' + error);
                            });
                        } else {
                            console.error('Error: Invalid or missing msg object.');
                        }
                    });
                });
            }
        });
    },
};
