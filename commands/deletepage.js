const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

const allowedUserIds = ['1016128744819265618', '1190305586710073427'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletepage')
        .setDescription('حذف صفحة من قاعدة البيانات.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        if (!allowedUserIds.includes(userId)) {
            return interaction.reply('لا تمتلك الصلاحية اللازمة لاستخدام هذا الأمر.');
        }

        // استعلام للحصول على قائمة الصفحات من قاعدة البيانات
        db.all(`SELECT title FROM pages`, function(err, rows) {
            if (err) {
                console.error(err.message);
                interaction.reply('حدث خطأ أثناء جلب قائمة الصفحات.');
                return;
            }

            // إنشاء قائمة منسدلة لاختيار الصفحة
            const selectMenu = new MessageSelectMenu()
                .setCustomId('select_page')
                .setPlaceholder('اختر صفحة للحذف')
                .addOptions(rows.map(row => ({ label: row.title, value: row.title })));

            // الرد بالقائمة المنسدلة
            interaction.reply({ content: 'اختر الصفحة التي ترغب في حذفها:', components: [new MessageActionRow().addComponents(selectMenu)], ephemeral: true });
        });
    },
    async handleSelectMenu(interaction) {
        const selectedPage = interaction.values[0]; // الصفحة المحددة من القائمة

        // حذف الصفحة المحددة من قاعدة البيانات
        db.run(`DELETE FROM pages WHERE title = ?`, selectedPage, function(err) {
            if (err) {
                console.error(err.message);
                interaction.reply('حدث خطأ أثناء حذف الصفحة.');
                return;
            }

            interaction.reply(`تم حذف الصفحة ${selectedPage} بنجاح.`);
        });
    }
};