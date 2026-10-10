async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(chatId, { text: '╭━〔 🔊 𝐆𝐑𝐎𝐔𝐏 𝐔𝐍𝐌𝐔𝐓𝐄𝐃 〕━━━╮
┃  ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Communication Restored
┃  🔓 𝐀𝐜𝐭𝐢𝐨𝐧 : Restrictions Lifted
┃  💬 𝐍𝐨𝐭𝐢𝐜𝐞 : Messaging Is Now Enabled
┃  😉 𝐒𝐢𝐥𝐞𝐧𝐜𝐞 𝐨𝐯𝐞𝐫. 𝐃𝐨𝐧’𝐭 𝐰𝐚𝐬𝐭𝐞 𝐢𝐭.
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯
⚙️ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓' });
}

module.exports = unmuteCommand;
