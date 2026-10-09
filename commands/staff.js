async function staffCommand(sock, chatId, msg) {
    try {
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');
        
        // Get group owner
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create staff text
        const text = `
≡ *GROUP ADMINS* _${groupMetadata.subject}_

╭━〔 👑 𝗚𝗥𝗢𝗨𝗣 𝗔𝗗𝗠𝗜𝗡𝗦 〕━╮
┃ 🛡️ 𝗔𝗨𝗧𝗛𝗢𝗥𝗜𝗭𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦
┃
┃ ✦ ${listAdmin}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗩𝗘𝗟𝗢𝗡𝗜𝗞𝗔 𝗕𝗢𝗧
`.trim();

        // Send the message with image and mentions
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

    } catch (error) {
        console.error('Error in staff command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to get admin list!' });
    }
}

module.exports = staffCommand; 