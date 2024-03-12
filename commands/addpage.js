const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');
const allowedUserIds = ['1016128744819265618', '1190305586710073427']; // معرف المستخدم المسموح له

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpage')
        .setDescription('إضافة صفحة جديدة.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('عنوان الصفحة.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('وصف الصفحة.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('features')
                .setDescription('ميزات الصفحة.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('version')
                .setDescription('إصدار الصفحة.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('src')
                .setDescription('مصدر الصفحة.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('رابط صورة للصفحة.')
                .setRequired(true)),
    async execute(interaction) {
        // التحقق مما إذا كان معرف المستخدم الحالي يتطابق مع المعرف المسموح له
        if (!allowedUserIds.includes(interaction.user.id)) {

            return await interaction.reply('لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.');

        }

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const features = interaction.options.getString('features');
        const version = interaction.options.getString('version');
        const src = interaction.options.getString('src');
        const imageUrl = interaction.options.getString('image_url');
        const currentDate = new Date().toISOString(); // يحصل على تاريخ ووقت الآن بتنسيق ISO

        db.serialize(() => {
            const stmt = db.prepare("INSERT INTO pages (title, description, features, version, src, date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run(title, description, features, version, src, currentDate, imageUrl);
            stmt.finalize();
        });

        await interaction.reply('تم إضافة الصفحة بنجاح.');
    },
};