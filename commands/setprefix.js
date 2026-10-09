
/**
 * Velonika Bot - .setprefix command
 *
 * Stores the chosen prefix in prefix.json at the repository root.
 * Your message handler must read that file to detect the new prefix.
 *
 * CommonJS module.
 */

const fs = require("fs");
const path = require("path");

const PREFIX_FILE = path.resolve(process.cwd(), "prefix.json");
const DEFAULT_PREFIX = ".";

function readPrefix() {
  try {
    if (!fs.existsSync(PREFIX_FILE)) return DEFAULT_PREFIX;

    const data = JSON.parse(
      fs.readFileSync(PREFIX_FILE, "utf8")
    );

    return typeof data.prefix === "string" && data.prefix.length
      ? data.prefix
      : DEFAULT_PREFIX;
  } catch (error) {
    console.error(
      "[setprefix] Could not read prefix.json:",
      error.message
    );
    return DEFAULT_PREFIX;
  }
}

function writePrefix(prefix) {
  fs.writeFileSync(
    PREFIX_FILE,
    JSON.stringify({ prefix }, null, 2) + "\n",
    "utf8"
  );
}

function getChatId(message) {
  return (
    message?.key?.remoteJid ||
    message?.chat ||
    message?.from ||
    ""
  );
}

async function sendText(client, chatId, text, quotedMessage) {
  if (client && typeof client.sendMessage === "function") {
    return client.sendMessage(
      chatId,
      { text },
      quotedMessage ? { quoted: quotedMessage } : {}
    );
  }

  if (
    quotedMessage &&
    typeof quotedMessage.reply === "function"
  ) {
    return quotedMessage.reply(text);
  }

  throw new Error(
    "Unsupported client/message API. Match this file to your bot's command handler."
  );
}

/**
 * Generic handler signature:
 * execute(client, message, args, context)
 *
 * args can be an array or a string.
 * context may contain isOwner, isSudo, isBotOwner,
 * isCreator, and config.
 */
async function execute(client, message, args, context = {}) {
  const chatId = getChatId(message);

  if (!chatId) {
    throw new Error("Could not determine chat ID.");
  }

  const input = Array.isArray(args)
    ? args.join(" ")
    : String(args || "");

  const newPrefix = input.trim();

  if (!newPrefix) {
    const current = readPrefix();

    return sendText(
      client,
      chatId,
      `Current prefix: ${current}\n` +
        `Usage: ${current}setprefix <new-prefix>\n` +
        `Example: ${current}setprefix 🔥`,
      message
    );
  }

  // Accept emojis, symbols, punctuation, and multiple characters.
  if (/\s/u.test(newPrefix)) {
    return sendText(
      client,
      chatId,
      "Prefix cannot contain spaces. Try 🔥 or ∆÷.",
      message
    );
  }

  // The command loader must provide a trusted owner flag.
  const hasPermission =
    context.isOwner === true ||
    context.isSudo === true ||
    context.isBotOwner === true ||
    context.isCreator === true;

  if (!hasPermission) {
    return sendText(
      client,
      chatId,
      "Only the bot owner can change the command prefix. Configure your command handler to pass context.isOwner = true for the owner.",
      message
    );
  }

  const oldPrefix = readPrefix();

  writePrefix(newPrefix);

  if (
    context.config &&
    typeof context.config === "object"
  ) {
    context.config.prefix = newPrefix;
  }

  if (
    global.config &&
    typeof global.config === "object"
  ) {
    global.config.prefix = newPrefix;
  }

  return sendText(
    client,
    chatId,
    `✅ Prefix updated!\n` +
      `Old prefix: ${oldPrefix}\n` +
      `New prefix: ${newPrefix}\n\n` +
      `Note: the message handler must read prefix.json (or the updated config) for this prefix to work across commands.`,
    message
  );
}

module.exports = {
  name: "setprefix",
  aliases: ["prefix"],
  category: "owner",
  description:
    "Change the bot command prefix; accepts emoji and symbols.",
  execute,
  run: execute,
  handler: execute,
  readPrefix,
  writePrefix,
};
