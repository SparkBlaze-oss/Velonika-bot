const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔══════════════════════════════╗
║   ⚡ 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓 ⚡       ║
╠══════════════════════════════╣
║ *🤖 ${settings.botName || 'Velonika-Bot'}*  
║ 🟢 Version: *${settings.version || '3.0.0'}*
║ 👑 Created by ${settings.botOwner || 'Spark Blaze'}
║ ✅ YT : ${global.ytch}
╚══════════════════════════════╝

╭───〔 ⚡ 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐂𝐎𝐑𝐄 〕───╮
│
│ ◈ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒 : 🟢 𝐀𝐂𝐓𝐈𝐕𝐄
│ ◈ 𝐀𝐂𝐂𝐄𝐒𝐒        : ✓ 𝐆𝐑𝐀𝐍𝐓𝐄𝐃
│ ◈ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍        : 𝟑.𝟎.𝟕
│
│ ⚙️ 𝐓𝐘𝐏𝐄  .menu 𝐓𝐎 𝐑𝐄𝐅𝐑𝐄𝐒𝐇
╰────────────────────────────╯

╭───〔 🌐 𝐆𝐄𝐍𝐄𝐑𝐀𝐋 〕───╮
│
│ ⚡ .help / .menu
│ ⚡ .ping
│ ⚡ .alive
│ ⚡ .tts <text>
│ ⚡ .owner
│ ⚡ .joke
│ ⚡ .quote
│ ⚡ .fact
│ ⚡ .weather <city>
│ ⚡ .news
│ ⚡ .attp <text>
│ ⚡ .lyrics <song_title>
│ ⚡ .8ball <question>
│ ⚡ .groupinfo
│ ⚡ .staff / .admins
│ ⚡ .vv
│ ⚡ .trt <text> <lang>
│ ⚡ .ss <link>
│ ⚡ .jid
│ ⚡ .url
╰────────────────────────╯

╭───〔 🛡️ 𝐀𝐃𝐌𝐈𝐍 〕───╮
│
│ 🛡️ .ban @user
│ 🛡️ .promote @user
│ 🛡️ .demote @user
│ 🛡️ .mute <minutes>
│ 🛡️ .unmute
│ 🛡️ .delete / .del
│ 🛡️ .kick @user
│ 🛡️ .warnings @user
│ 🛡️ .warn @user
│ 🛡️ .antilink
│ 🛡️ .antibadword
│ 🛡️ .clear
│ 🛡️ .tag <message>
│ 🛡️ .tagall
│ 🛡️ .tagnotadmin
│ 🛡️ .hidetag <message>
│ 🛡️ .chatbot
│ 🛡️ .resetlink
│ 🛡️ .antitag <on/off>
│ 🛡️ .welcome <on/off>
│ 🛡️ .goodbye <on/off>
│ 🛡️ .setgdesc <description>
│ 🛡️ .setgname <new name>
│ 🛡️ .setgpp <reply to image>
╰────────────────────────╯

╭───〔 🎮 𝐆𝐀𝐌𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 〕───╮
│
│ 🎮 .tictactoe @user
│ 🎮 .hangman
│ 🎮 .guess <letter>
│ 🎮 .trivia
│ 🎮 .answer <answer>
│ 🎮 .truth
│ 🎮 .dare
╰──────────────────────────╯

╭───〔 🎯 𝐅𝐔𝐍 𝐒𝐘𝐒𝐓𝐄𝐌 〕───╮
│
│ ✨ .compliment @user
│ ✨ .insult @user
│ ✨ .flirt
│ ✨ .shayari
│ ✨ .goodnight
│ ✨ .roseday
│ ✨ .character @user
│ ✨ .wasted @user
│ ✨ .ship @user
│ ✨ .simp @user
│ ✨ .stupid @user [text]
╰──────────────────────────╯

╭───〔 🧠 𝐀𝐈 𝐂𝐎𝐑𝐄 〕───╮
│
│ 🧠 .gpt <question>
│ 🧠 .gemini <question>
│ 🧠 .imagine <prompt>
│ 🧠 .flux <prompt>
│ 🧠 .sora <prompt>
╰────────────────────────╯

╭───〔 📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 〕───╮
│
│ 📥 .play <song_name>
│ 📥 .song <song_name>
│ 📥 .spotify <query>
│ 📥 .instagram <link>
│ 📥 .facebook <link>
│ 📥 .tiktok <link>
│ 📥 .video <song name>
│ 📥 .ytmp4 <Link>
╰──────────────────────────╯

╭───〔 🎨 𝐈𝐌𝐀𝐆𝐄 / 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 〕───╮
│
│ ✦ .blur <image>
│ ✦ .simage <reply to sticker>
│ ✦ .sticker <reply to image>
│ ✦ .removebg
│ ✦ .remini
│ ✦ .crop <reply to image>
│ ✦ .tgsticker <Link>
│ ✦ .meme
│ ✦ .take <packname>
│ ✦ .emojimix <emj1>+<emj2>
│ ✦ .igs <insta link>
│ ✦ .igsc <insta link>
╰────────────────────────────╯

╭───〔 🖼️ 𝐏𝐈𝐄𝐒 〕───╮
│
│ ◇ .pies <country>
│ ◇ .china
│ ◇ .indonesia
│ ◇ .japan
│ ◇ .korea
│ ◇ .hijab
╰───────────────────╯

╭───〔 🔤 𝐓𝐄𝐗𝐓𝐌𝐀𝐊𝐄𝐑 〕───╮
│
│ ◈ .metallic <text>
│ ◈ .ice <text>
│ ◈ .snow <text>
│ ◈ .impressive <text>
│ ◈ .matrix <text>
│ ◈ .light <text>
│ ◈ .neon <text>
│ ◈ .devil <text>
│ ◈ .purple <text>
│ ◈ .thunder <text>
│ ◈ .leaves <text>
│ ◈ .1917 <text>
│ ◈ .arena <text>
│ ◈ .hacker <text>
│ ◈ .sand <text>
│ ◈ .blackpink <text>
│ ◈ .glitch <text>
│ ◈ .fire <text>
╰────────────────────────╯

╭───〔 🔐 𝐎𝐖𝐍𝐄𝐑 〕───╮
│
│ 🔐 .mode <public/private>
│ 🔐 .clearsession
│ 🔐 .antidelete
│ 🔐 .cleartmp
│ 🔐 .update
│ 🔐 .settings
│ 🔐 .setpp <reply to image>
│ 🔐 .autoreact <on/off>
│ 🔐 .autostatus <on/off>
│ 🔐 .autostatus react <on/off>
│ 🔐 .autotyping <on/off>
│ 🔐 .autoread <on/off>
│ 🔐 .anticall <on/off>
│ 🔐 .pmblocker <on/off/status>
│ 🔐 .pmblocker setmsg <text>
│ 🔐 .setmention <reply to msg>
│ 🔐 .mention <on/off>
╰────────────────────────╯

╭───〔 🧩 𝐌𝐈𝐒𝐂 〕───╮
│
│ ◆ .heart
│ ◆ .horny
│ ◆ .circle
│ ◆ .lgbt
│ ◆ .lolice
│ ◆ .its-so-stupid
│ ◆ .namecard
│ ◆ .oogway
│ ◆ .tweet
│ ◆ .ytcomment
│ ◆ .comrade
│ ◆ .gay
│ ◆ .glass
│ ◆ .jail
│ ◆ .passed
│ ◆ .triggered
╰────────────────────╯

╭───〔 🎌 𝐀𝐍𝐈𝐌𝐄 〕───╮
│
│ 🎌 .nom
│ 🎌 .poke
│ 🎌 .cry
│ 🎌 .kiss
│ 🎌 .pat
│ 🎌 .hug
│ 🎌 .wink
│ 🎌 .facepalm
╰────────────────────╯

╭───〔 💻 𝐆𝐈𝐓𝐇𝐔𝐁 〕───╮
│
│ 💻 .git
│ 💻 .github
│ 💻 .sc
│ 💻 .script
│ 💻 .repo
╰────────────────────╯

╔══════════════════════════════╗
║   🌌 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄   ║
╠══════════════════════════════╣
║ 🟢 SYSTEM   : 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐎𝐍𝐀𝐋 ║
║ ⚡ CORE     : 𝐀𝐂𝐓𝐈𝐕𝐄       ║
║ 🔐 ACCESS   : 𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐙𝐄𝐃 ║
║                              ║
║ > ⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐀𝐃𝐘...       ║
║ > ⚡ 𝐀𝐖𝐀𝐈𝐓𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃_ ║
╚══════════════════════════════╝

✦ 𝐕𝐄𝐋𝐎𝐍𝐈𝐊𝐀 𝐁𝐎𝐓 • 𝟑.𝟎.𝟕 ✦`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDiiR2FcowAYq6bIB1m@newsletter',
                        newsletterName: 'Velonika bot',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '0029VbDiiR2FcowAYq6bIB1m@newsletter',
                        newsletterName: 'KnightBot MD by Mr Unique Hacker',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;