const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

function loadWarnings() {
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
    }
    const data = fs.readFileSync(warningsFilePath, 'utf8');
    return JSON.parse(data);
}

async function warningsCommand(sock, chatId, mentionedJidList) {
    const warnings = loadWarnings();

    if (mentionedJidList.length === 0) {
        await sock.sendMessage(chatId, { text: 'Please mention a user to check warnings.' });
        return;
    }

    const userToCheck = mentionedJidList[0];
    const warningCount = warnings[userToCheck] || 0;

    await sock.sendMessage(chatId, { text: `╭━〔 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𝐒𝐓𝐀𝐓𝐔𝐒 〕━━╮
┃ 👤 𝐔𝐬𝐞𝐫: @${user.split('@')[0]}
┃ ⚠️ 𝐖𝐚𝐫𝐧𝐢𝐧𝐠𝐬: ${warningCount}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓  • 🔥 ᴄʀᴇᴀᴛᴇᴅ ʙʏ 𝐒𝐏𝐀𝐑𝐊 𝐁𝐋𝐀𝐙𝐄` });
}

module.exports = warningsCommand;
