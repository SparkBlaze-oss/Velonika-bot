const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function unbanCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '╭━━〔 ⚠️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐐𝐔𝐈𝐑𝐄𝐃 〕━━╮
┃ 🤖 Promote the bot to Group Admin
┃ 🔓 Required to use ".unban"
┃ ⚙️ ACTION: Grant Admin Access
╰━━━━━━━━━━━━━━━━━━━━━━╯
✦ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓', ...channelInfo }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '╭━━〔 ⚠️ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐐𝐔𝐈𝐑𝐄𝐃 〕━━╮
┃ 🤖 Promote the bot to Group Admin
┃ 🔓 Required to use ".unban"
┃ ⚙️ ACTION: Grant Admin Access
╰━━━━━━━━━━━━━━━━━━━━━━╯
✦ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓', ...channelInfo }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat', ...channelInfo }, { quoted: message });
            return;
        }
    }
    let userToUnban;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: '╭━〔 ⚠️ 𝐔𝐍𝐁𝐀𝐍 𝐑𝐄𝐐𝐔𝐄𝐒𝐓 〕━━╮
┃ Please mention the user or
┃ reply to their message to proceed.
┃
┃ ➤ 𝐀𝐜𝐭𝐢𝐨𝐧: Identify the target user.
╰━━━━━━━━━━━━━━━━━━━━━╯', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `╭━━━〔 🛡️ 𝐔𝐍𝐁𝐀𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 〕━━━╮
┃  ✅ 𝐔𝐬𝐞𝐫 𝐔𝐧𝐛𝐚𝐧𝐧𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲
┃  👤 𝐔𝐬𝐞𝐫 : @${userToUnban.split('@')[0]}
┃  📋 𝐒𝐭𝐚𝐭𝐮𝐬 : 🟢 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
⚙️ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `╭━━━〔 🛡️ 𝐔𝐍𝐁𝐀𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 〕━━━╮
┃  ✅ 𝐔𝐬𝐞𝐫 𝐔𝐧𝐛𝐚𝐧𝐧𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲
┃  👤 𝐔𝐬𝐞𝐫 : @${userToUnban.split('@')[0]}
┃  📋 𝐒𝐭𝐚𝐭𝐮𝐬 : 🟢 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
⚙️ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓`,
                mentions: [userToUnban],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in unban command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to unban user!', ...channelInfo }, { quoted: message });
    }
}

module.exports = unbanCommand; 