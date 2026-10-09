'use strict';
/** Eclipcium (Ec) group economy for Velonika Bot Pro.
 * Original bot credits and license must remain intact.
 */
const fs = require('fs');
const path = require('path');
const { pnix, mode } = require('../lib/commands');
const config = require('../config');

const DATA_DIR = path.join(process.cwd(), 'database');
const DATA_FILE = path.join(DATA_DIR, 'eclipcium.json');
const STARTING_WALLET = 1000;
const STARTING_BANK = 0;
const MAX_BALANCE = Number.MAX_SAFE_INTEGER;
const DAILY_REWARD = 7000;
const STREAK_STEP_BONUS = 400;
const SEVEN_DAY_BONUS = 5000;
const WEEKLY_BONUS = 15000;
const MONTHLY_BONUS = 50000;
let queue = Promise.resolve();

function readDB() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (parsed && parsed.version === 1 && parsed.groups && typeof parsed.groups === 'object') return parsed;
  } catch (_) {}
  return { version: 1, groups: {} };
}
function writeDB(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DATA_FILE);
}
function transact(fn) {
  const run = queue.then(() => { const db = readDB(); const result = fn(db); writeDB(db); return result; });
  queue = run.catch(() => {});
  return run;
}
function groupData(db, groupId) {
  if (!db.groups[groupId]) db.groups[groupId] = { members: {}, createdAt: Date.now() };
  return db.groups[groupId];
}
function memberData(group, id, name) {
  if (!group.members[id]) group.members[id] = {
    id, name: name || 'Eclipcium Member', bio: 'New to the Eclipcium world ✨', wallet: STARTING_WALLET,
    bank: STARTING_BANK, earned: 0, spent: 0, knifeProtection: 0, dailyStreak: 0, lastDaily: '',
    lastWeeklyBonus: '', lastMonthlyBonus: '', createdAt: Date.now(), updatedAt: Date.now()
  };
  // Backfill fields for profiles created by older versions of the currency pack.
  const p = group.members[id];
  if (!Number.isFinite(p.knifeProtection)) p.knifeProtection = 0;
  if (!Number.isFinite(p.dailyStreak)) p.dailyStreak = 0;
  if (typeof p.lastDaily !== 'string') p.lastDaily = '';
  if (typeof p.lastWeeklyBonus !== 'string') p.lastWeeklyBonus = '';
  if (typeof p.lastMonthlyBonus !== 'string') p.lastMonthlyBonus = '';
  if (name && name !== 'Eclipcium Member') group.members[id].name = String(name).slice(0, 80);
  return group.members[id];
}
const intAmount = (s) => {
  if (!/^\d+$/.test(String(s || ''))) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 && n <= MAX_BALANCE ? n : null;
};
const fmt = n => Math.trunc(n).toLocaleString('en-IN');
const money = n => `💷 ${fmt(n)} Ec`;
function dateKey(date = new Date()) { const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date); const v = Object.fromEntries(parts.map(x => [x.type, x.value])); return `${v.year}-${v.month}-${v.day}`; }
function shiftDate(key, days) { const [y, m, d] = key.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d + days, 12)); return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`; }
function weekKey(key) { const dt = new Date(`${key}T12:00:00Z`); const day = (dt.getUTCDay() + 6) % 7; dt.setUTCDate(dt.getUTCDate() - day + 3); const year = dt.getUTCFullYear(); const first = new Date(Date.UTC(year, 0, 4, 12)); const firstDay = (first.getUTCDay() + 6) % 7; first.setUTCDate(first.getUTCDate() - firstDay + 3); const week = 1 + Math.round((dt - first) / 604800000); return `${year}-W${String(week).padStart(2,'0')}`; }
const cleanId = x => String(x || '').replace(/[^0-9]/g, '');
function getGroup(m) { return m.jid || m.chat || m.from || m.groupId || ''; }
function getSender(m) { return m.sender || m.participant || m.author || m.user || ''; }
function getName(m) { return m.pushName || m.name || m.senderName || 'Eclipcium Member'; }
function getText(m) { return String(m.text || m.body || m.message || m.argsText || '').trim(); }
function getMentions(m) { return m.mentionedJid || m.mentions || m.mentioned || []; }
async function reply(m, text) {
  if (typeof m.reply === 'function') return m.reply(text);
  if (typeof m.sendMessage === 'function') return m.sendMessage(text);
  if (m.client && typeof m.client.sendMessage === 'function') return m.client.sendMessage(getGroup(m), { text }, { quoted: m });
  throw new Error('Could not find the message reply method for this bot framework.');
}
function parseTarget(m, raw) {
  const mentions = getMentions(m);
  if (mentions.length) return String(mentions[0]);
  const digits = cleanId(raw);
  return digits.length >= 5 ? digits + '@s.whatsapp.net' : '';
}
function isOwner(m) {
  const sender = cleanId(getSender(m));
  const allowed = String(config.SUDO || '').split(',').map(cleanId).filter(Boolean);
  return Boolean(m.fromMe || m.isOwner || (sender && allowed.includes(sender)));
}
function parseArgs(m) {
  const text = getText(m);
  const prefix = String(config.PREFIX || '.');
  const noPrefix = text.startsWith(prefix) ? text.slice(prefix.length) : text;
  return noPrefix.trim().split(/\s+/).slice(1);
}
function requireGroup(m) { return Boolean(getGroup(m) && /@g\.us$/.test(getGroup(m))); }
async function run(m, action) {
  if (!requireGroup(m)) return reply(m, '🌘 Eclipcium is available inside group chats only.');
  const groupId = getGroup(m);
  const sender = getSender(m);
  if (!sender) return reply(m, '⚠️ I could not identify your WhatsApp account.');
  const senderId = String(sender);
  const name = getName(m);
  const args = parseArgs(m);

  if (action === 'daily') {
    const today = dateKey();
    const result = await transact(db => {
      const p = memberData(groupData(db, groupId), senderId, name);
      if (p.lastDaily === today) return { error: 'CLAIMED', p };
      const yesterday = shiftDate(today, -1);
      p.dailyStreak = p.lastDaily === yesterday ? Math.min(3650, p.dailyStreak + 1) : 1;
      p.lastDaily = today;
      const streakBonus = p.dailyStreak * STREAK_STEP_BONUS;
      const sevenDayBonus = p.dailyStreak % 7 === 0 ? SEVEN_DAY_BONUS : 0;
      const total = DAILY_REWARD + streakBonus + sevenDayBonus;
      if (p.wallet > MAX_BALANCE - total) return { error: 'OVERFLOW' };
      p.wallet += total; p.earned += total; p.knifeProtection += 1; p.updatedAt = Date.now();
      return { p: { ...p }, streakBonus, sevenDayBonus, total };
    });
    if (result.error === 'CLAIMED') return reply(m, `🎁 You already claimed today's reward!\n⏳ Come back after midnight (India time).\n🔥 Current streak: ${result.p.dailyStreak} day(s)`);
    if (result.error) return reply(m, '❌ Your wallet is too close to the maximum supported balance.');
    const streak = result.p.dailyStreak;
    const progressCount = streak > 0 ? ((streak - 1) % 7) + 1 : 0;
    const progress = Array.from({ length: 7 }, (_, i) => i < progressCount ? '🟩' : '⬜').join(' ');
    return reply(m, `🎁 *@${String(senderId).split('@')[0]} Daily Reward!*\n\n💰 +${fmt(DAILY_REWARD)} Ec\n🔪 +1 Knife Protection!\n📅 *Daily Reward Streak:*\n${progress}\n🔥 Current Streak: *${result.p.dailyStreak}* day(s)\n✨ Streak Bonus: *+${fmt(result.streakBonus)} Ec*${result.sevenDayBonus ? `\n🏆 7-Day Streak Bonus: *+${fmt(result.sevenDayBonus)} Ec*` : ''}\n💷 Total added: *${fmt(result.total)} Ec*\n\n📆 Claim once per day to keep your streak alive!`);
  }
  if (action === 'weekly' || action === 'monthly') {
    const today = dateKey();
    const result = await transact(db => {
      const p = memberData(groupData(db, groupId), senderId, name);
      const required = action === 'weekly' ? 7 : 30;
      const key = action === 'weekly' ? weekKey(today) : today.slice(0, 7);
      const lastKey = action === 'weekly' ? p.lastWeeklyBonus : p.lastMonthlyBonus;
      if (p.dailyStreak < required) return { error: 'STREAK', required, streak: p.dailyStreak };
      if (lastKey === key) return { error: 'CLAIMED' };
      const amount = action === 'weekly' ? WEEKLY_BONUS : MONTHLY_BONUS;
      const itemCount = action === 'weekly' ? 3 : 10;
      if (p.wallet > MAX_BALANCE - amount) return { error: 'OVERFLOW' };
      p.wallet += amount; p.earned += amount; p.knifeProtection += itemCount;
      if (action === 'weekly') p.lastWeeklyBonus = key; else p.lastMonthlyBonus = key;
      p.updatedAt = Date.now();
      return { amount, itemCount, wallet: p.wallet, streak: p.dailyStreak };
    });
    if (result.error === 'STREAK') return reply(m, `🔒 *${action === 'weekly' ? 'Weekly' : 'Monthly'} Bonus Locked*\nKeep your daily streak going! Required streak: ${result.required} days.\n🔥 Your current streak: ${result.streak} day(s).`);
    if (result.error === 'CLAIMED') return reply(m, `🎁 You've already claimed this ${action} bonus for the current ${action === 'weekly' ? 'week' : 'month'}.`);
    if (result.error) return reply(m, '❌ Your wallet is too close to the maximum supported balance.');
    return reply(m, `🎉 *${action === 'weekly' ? 'WEEKLY' : 'MONTHLY'} ECLIPCIUM BONUS!*\n\n💰 +${fmt(result.amount)} Ec\n🔪 +${result.itemCount} Knife Protection!\n🔥 Streak: ${result.streak} days\n👛 New wallet balance: ${money(result.wallet)}\n\n🌘 Keep your streak alive, Eclipcium member!`);
  }
  if (action === 'protection') {
    const result = await transact(db => { const p = memberData(groupData(db, groupId), senderId, name); return { count: p.knifeProtection }; });
    return reply(m, `🔪 *Knife Protection Inventory*\nYou own: *${result.count}* Knife Protection item(s).\n🎁 Earn more with ${config.PREFIX}daily, ${config.PREFIX}weekly, and ${config.PREFIX}monthly.`);
  }
  if (action === 'profile' || action === 'wallet' || action === 'bank' || action === 'balance') {
    const result = await transact(db => {
      const g = groupData(db, groupId); const p = memberData(g, senderId, name);
      return { ...p, members: Object.keys(g.members).length };
    });
    if (action === 'wallet') return reply(m, `👛 *${result.name}'s Wallet*\n${money(result.wallet)}\n\n💷 Eclipcium (Ec) · ${result.members} registered member(s) in this GC`);
    if (action === 'bank') return reply(m, `🏦 *${result.name}'s Bank*\n${money(result.bank)}\n\n🔐 Stored safely in this group's economy ledger.`);
    return reply(m, `🌘 *ECLIPCIUM PROFILE*\n━━━━━━━━━━━━━━\n👤 *${result.name}*\n📝 ${result.bio}\n\n👛 Wallet: ${money(result.wallet)}\n🏦 Bank: ${money(result.bank)}\n💰 Net worth: ${money(result.wallet + result.bank)}\n🔪 Knife Protection: ${fmt(result.knifeProtection || 0)}\n🔥 Daily streak: ${fmt(result.dailyStreak || 0)} day(s)\n📈 Earned: ${money(result.earned)}\n📉 Spent: ${money(result.spent)}\n🗓️ Joined: ${new Date(result.createdAt).toLocaleDateString('en-IN')}\n━━━━━━━━━━━━━━\n💷 Currency: Eclipcium (Ec)`);
  }
  if (action === 'setbio') {
    const bio = args.join(' ').slice(0, 160);
    if (!bio) return reply(m, `Usage: ${config.PREFIX}setbio your profile bio`);
    await transact(db => { const p = memberData(groupData(db, groupId), senderId, name); p.bio = bio; p.updatedAt = Date.now(); });
    return reply(m, `✨ Profile bio updated for this GC.\n📝 ${bio}`);
  }
  if (action === 'deposit' || action === 'withdraw') {
    const amount = intAmount(args[0]);
    if (!amount) return reply(m, `⚠️ Enter a positive whole Ec amount.\nExample: ${config.PREFIX}${action} 250`);
    const result = await transact(db => {
      const p = memberData(groupData(db, groupId), senderId, name);
      const from = action === 'deposit' ? 'wallet' : 'bank';
      const to = action === 'deposit' ? 'bank' : 'wallet';
      if (p[from] < amount) return { error: `INSUFFICIENT_${from.toUpperCase()}`, wallet: p.wallet, bank: p.bank };
      if (p[to] > MAX_BALANCE - amount) return { error: 'OVERFLOW' };
      p[from] -= amount; p[to] += amount; p.updatedAt = Date.now();
      return { wallet: p.wallet, bank: p.bank };
    });
    if (result.error === 'INSUFFICIENT_WALLET') return reply(m, `❌ Not enough in your wallet.\n👛 Available: ${money(result.wallet)}`);
    if (result.error === 'INSUFFICIENT_BANK') return reply(m, `❌ Not enough in your bank.\n🏦 Available: ${money(result.bank)}`);
    if (result.error) return reply(m, '❌ That amount exceeds the supported balance limit.');
    return reply(m, `${action === 'deposit' ? '🏦 Deposit complete!' : '👛 Withdrawal complete!'}\nAmount: ${money(amount)}\n👛 Wallet: ${money(result.wallet)}\n🏦 Bank: ${money(result.bank)}`);
  }
  if (action === 'pay' || action === 'giveec') {
    const target = parseTarget(m, args[0]);
    const amount = intAmount(args[1]);
    if (action === 'giveec' && !isOwner(m)) return reply(m, '🔒 Only the bot owner can mint Ec with this command.');
    if (!target || !amount) return reply(m, `Usage: ${config.PREFIX}${action} @member amount\nExample: ${config.PREFIX}${action} @member 500`);
    if (target === senderId) return reply(m, '😅 You cannot transfer Ec to yourself.');
    const result = await transact(db => {
      const g = groupData(db, groupId); const from = memberData(g, senderId, name); const to = memberData(g, target, 'Eclipcium Member');
      if (action === 'pay' && from.wallet < amount) return { error: 'FUNDS', wallet: from.wallet };
      if (to.wallet > MAX_BALANCE - amount) return { error: 'OVERFLOW' };
      if (action === 'pay') { from.wallet -= amount; from.spent += amount; }
      to.wallet += amount; to.earned += amount;
      from.updatedAt = to.updatedAt = Date.now();
      return { from: from.wallet, to: to.wallet, targetName: to.name };
    });
    if (result.error === 'FUNDS') return reply(m, `❌ Not enough Ec in your wallet. Available: ${money(result.wallet)}`);
    if (result.error) return reply(m, '❌ The recipient balance would exceed the supported limit.');
    return reply(m, `${action === 'pay' ? '💸 Transfer successful!' : '✨ Ec granted by the bot owner!'}\n👤 To: ${result.targetName}\n💷 Amount: ${money(amount)}\n👛 Your wallet: ${action === 'pay' ? money(result.from) : 'unchanged'}\n👛 Recipient wallet: ${money(result.to)}`);
  }
  if (action === 'leaderboard') {
    const rows = await transact(db => Object.values(groupData(db, groupId).members).sort((a,b) => (b.wallet+b.bank)-(a.wallet+a.bank)).slice(0, 10).map((p,i) => `${i+1}. ${p.name} — ${money(p.wallet+p.bank)}`));
    return reply(m, `🏆 *ECLIPCIUM LEADERBOARD*\n━━━━━━━━━━━━━━\n${rows.length ? rows.join('\n') : 'No profiles yet.'}\n━━━━━━━━━━━━━━\n💷 Total wealth = wallet + bank`);
  }
  if (action === 'echelp') return reply(m, `🌘 *ECLIPCIUM CURRENCY PACK*\n${config.PREFIX}profile / ${config.PREFIX}pf — full profile\n${config.PREFIX}balance / ${config.PREFIX}bal — balances\n${config.PREFIX}wallet / ${config.PREFIX}w — wallet\n${config.PREFIX}bank / ${config.PREFIX}bk — bank\n${config.PREFIX}deposit 250 / ${config.PREFIX}dp 250 — wallet → bank\n${config.PREFIX}withdraw 100 / ${config.PREFIX}wd 100 — bank → wallet\n${config.PREFIX}pay @member 50 / ${config.PREFIX}tr @member 50 — transfer Ec\n${config.PREFIX}setbio text / ${config.PREFIX}bio text — edit your bio\n${config.PREFIX}ecrich / ${config.PREFIX}top — group leaderboard\n${config.PREFIX}giveec @member 500 / ${config.PREFIX}gec @member 500 — owner-only grant\n${config.PREFIX}ec / ${config.PREFIX}cur — this guide\n${config.PREFIX}daily / ${config.PREFIX}d — daily reward (+7,000 Ec + 1 protection)\n${config.PREFIX}weekly / ${config.PREFIX}wk — weekly bonus (7-day streak)\n${config.PREFIX}monthly / ${config.PREFIX}mo — monthly bonus (30-day streak)\n${config.PREFIX}protection / ${config.PREFIX}kp — check Knife Protection inventory\n\n💷 Currency: Eclipcium (Ec)\n👛 New profiles start with 1,000 Ec.\n👥 Profiles and balances are separate for every group.`)
}

// The bot framework's existing plugin loader exposes pnix globally in its plugin scope.
// Keep every command in this single feature module so the ledger rules stay consistent.
if (typeof pnix === 'function') {
  // Short aliases map to the same canonical handlers, so every alias uses identical validation.
  const commands = [
    ['profile', 'View your Eclipcium profile', 'profile'], ['pf', 'Short alias: profile', 'profile'],
    ['ec', 'Open the Eclipcium currency guide', 'echelp'], ['cur', 'Short alias: currency guide', 'echelp'],
    ['wallet', 'Check your Ec wallet', 'wallet'], ['w', 'Short alias: wallet', 'wallet'],
    ['bank', 'Check your Ec bank', 'bank'], ['bk', 'Short alias: bank', 'bank'],
    ['balance', 'Check your Ec balances', 'balance'], ['bal', 'Short alias: balance', 'balance'],
    ['deposit', 'Deposit wallet Ec into your bank', 'deposit'], ['dp', 'Short alias: deposit', 'deposit'],
    ['withdraw', 'Withdraw bank Ec into your wallet', 'withdraw'], ['wd', 'Short alias: withdraw', 'withdraw'],
    ['pay', 'Transfer Ec to a group member', 'pay'], ['tr', 'Short alias: transfer Ec', 'pay'],
    ['giveec', 'Owner-only: grant Ec to a group member', 'giveec'], ['gec', 'Owner-only short alias: grant Ec', 'giveec'],
    ['setbio', 'Set your group profile bio', 'setbio'], ['bio', 'Short alias: set profile bio', 'setbio'],
    ['ecrich', 'View the group Eclipcium leaderboard', 'leaderboard'], ['top', 'Short alias: leaderboard', 'leaderboard'],
    ['daily', 'Claim your daily Eclipcium reward', 'daily'], ['d', 'Short alias: daily reward', 'daily'],
    ['weekly', 'Claim the weekly bonus with a 7-day streak', 'weekly'], ['wk', 'Short alias: weekly bonus', 'weekly'],
    ['monthly', 'Claim the monthly bonus with a 30-day streak', 'monthly'], ['mo', 'Short alias: monthly bonus', 'monthly'],
    ['protection', 'Check Knife Protection inventory', 'protection'], ['kp', 'Short alias: protection inventory', 'protection']
  ];
  for (const [command, desc, action] of commands) {
    pnix({ command, desc, type: 'currency', filename: __filename, fromMe: mode }, async (m) => {
      try { return await run(m, action); }
      catch (err) { console.error('[Eclipcium]', err); return reply(m, '⚠️ Eclipcium could not complete that action. Your balance was not intentionally changed; please try again.'); }
    });
  }
}
module.exports = { transact, readDB, money };
