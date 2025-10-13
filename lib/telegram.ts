// lib/telegram.ts
export async function sendTelegram(
  text: string,
  opts?: { parseMode?: 'MarkdownV2' | 'HTML'; chatId?: string }
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts?.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: opts?.parseMode ?? 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram send failed:', body);
  }
}
