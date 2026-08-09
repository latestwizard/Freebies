import fs from 'fs';
import path from 'path';

/**
 * Sends a webhook notification to Discord or Slack on scraper errors.
 */
async function sendWebhookAlert(errors) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️ No DISCORD_WEBHOOK_URL or SLACK_WEBHOOK_URL environment variable set. Skipping alert.');
    return;
  }

  const isDiscord = webhookUrl.includes('discord.com');
  const errorDetails = errors.map(e => `• **${e.source}**: ${e.error}`).join('\n');

  const payload = isDiscord
    ? {
        username: 'FreebieVerse Scraper Bot',
        embeds: [
          {
            title: '🚨 Scraper Source Failure Alert',
            description: `One or more RSS feeds failed during automated execution:\n\n${errorDetails}`,
            color: 15158332, // Red
            timestamp: new Date().toISOString(),
          },
        ],
      }
    : {
        text: `🚨 *FreebieVerse Scraper Alert*\nOne or more RSS feeds failed during automated execution:\n${errorDetails}`,
      };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      console.log('✅ Sent webhook failure alert successfully.');
    } else {
      console.error(`❌ Webhook notification failed with status ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Failed to dispatch webhook notification:', err.message);
  }
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#039;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .trim();
}

async function fetchReddit(errors) {
  console.log('🤖 [1/3] Fetching Reddit r/freebies...');
  try {
    const res = await fetch('https://old.reddit.com/r/freebies/.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xml = await res.text();
    const entries = xml.split('<entry>').slice(1);
    const deals = [];
    let count = 0;

    for (const entry of entries) {
      if (count >= 6) break;
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const linkMatch = entry.match(/<link href="(.*?)"/);
      const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/);

      if (!titleMatch || !linkMatch) continue;

      const rawTitle = decodeEntities(titleMatch[1]);
      const link = linkMatch[1];
      const updated = updatedMatch ? updatedMatch[1] : new Date().toISOString();

      if (rawTitle.toLowerCase().includes('welcome') || rawTitle.toLowerCase().includes('expired')) continue;
      const cleanTitle = rawTitle.replace(/^\[.*?\]\s*/, '').trim();
      count++;

      deals.push({
        id: `reddit-${count}-${Date.now()}`,
        title: cleanTitle.length > 65 ? cleanTitle.substring(0, 62) + '...' : cleanTitle,
        provider: 'r/freebies Community',
        logoText: 'RED',
        logoBg: 'linear-gradient(135deg, #FF4500, #CC3700)',
        category: 'samples',
        shortDesc: cleanTitle,
        fullDesc: `${cleanTitle}. Community verified on Reddit r/freebies.`,
        valueText: '100% Free Sample',
        referralUrl: link,
        upvotes: 120 + count * 15,
        claimsCount: 210 + count * 35,
        verifiedDate: 'Today',
        status: 'verified',
        verifiedAt: new Date().toISOString().split('T')[0],
        createdAt: updated.split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'REDDIT',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open the Reddit discussion and direct sample link.',
          'Follow the provider form instructions to request your free sample.',
          'Allow 2-4 weeks for physical mail-in delivery.'
        ],
        terms: 'Community freebie offer sourced from Reddit r/freebies. Provider terms apply.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 deals from feed.');
    return deals;
  } catch (err) {
    console.error('Error fetching Reddit:', err.message);
    errors.push({ source: 'Reddit r/freebies', error: err.message });
    return [];
  }
}

async function fetchDoctorOfCredit(errors) {
  console.log('💳 [2/3] Fetching Doctor of Credit (Free Money & Bank Bonuses)...');
  try {
    const res = await fetch('https://www.doctorofcredit.com/category/free-money/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xml = await res.text();
    const items = xml.split('<item>').slice(1);
    const deals = [];
    let count = 0;

    for (const item of items) {
      if (count >= 6) break;
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

      if (!titleMatch || !linkMatch) continue;

      const rawTitle = decodeEntities(titleMatch[1]);
      const link = linkMatch[1];
      const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

      if (rawTitle.toLowerCase().includes('expired')) continue;
      count++;

      deals.push({
        id: `doc-${count}-${Date.now()}`,
        title: rawTitle.length > 65 ? rawTitle.substring(0, 62) + '...' : rawTitle,
        provider: 'Doctor of Credit',
        logoText: 'DOC',
        logoBg: 'linear-gradient(135deg, #0284C7, #0369A1)',
        category: 'finance',
        shortDesc: rawTitle,
        fullDesc: `${rawTitle}. Curated and verified by Doctor of Credit deal editors.`,
        valueText: 'Cash Bonus / Free Money',
        referralUrl: link,
        upvotes: 350 + count * 25,
        claimsCount: 1800 + count * 50,
        verifiedDate: 'Today',
        status: 'verified',
        verifiedAt: new Date().toISOString().split('T')[0],
        createdAt: new Date(pubDate).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'DOC',
        featured: true,
        steps: [
          'Click "Claim Freebie" to open Doctor of Credit\'s deal analysis.',
          'Review the signup bonus eligibility requirements.',
          'Follow the provider link to complete signup and unlock your cash bonus!'
        ],
        terms: 'Curated by Doctor of Credit. Terms apply per financial institution.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 deals from feed.');
    return deals;
  } catch (err) {
    console.error('Error fetching Doctor of Credit:', err.message);
    errors.push({ source: 'Doctor of Credit', error: err.message });
    return [];
  }
}

async function fetchFreeStuffFinder(errors) {
  console.log('🎁 [3/3] Fetching Free Stuff Finder...');
  try {
    const res = await fetch('https://www.freestufffinder.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xml = await res.text();
    const items = xml.split('<item>').slice(1);
    const deals = [];
    let count = 0;

    for (const item of items) {
      if (count >= 6) break;
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

      if (!titleMatch || !linkMatch) continue;

      const rawTitle = decodeEntities(titleMatch[1]);
      const link = linkMatch[1];
      const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

      if (rawTitle.toLowerCase().includes('expired')) continue;
      count++;

      deals.push({
        id: `fsf-${count}-${Date.now()}`,
        title: rawTitle.length > 65 ? rawTitle.substring(0, 62) + '...' : rawTitle,
        provider: 'Free Stuff Finder',
        logoText: 'FSF',
        logoBg: 'linear-gradient(135deg, #EC4899, #BE185D)',
        category: 'samples',
        shortDesc: rawTitle,
        fullDesc: `${rawTitle}. Curated by Free Stuff Finder bargain editors.`,
        valueText: '100% Freebie',
        referralUrl: link,
        upvotes: 210 + count * 18,
        claimsCount: 950 + count * 30,
        verifiedDate: 'Today',
        status: 'verified',
        verifiedAt: new Date().toISOString().split('T')[0],
        createdAt: new Date(pubDate).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'FSF',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open Free Stuff Finder offer page.',
          'Follow the free sample request instructions.',
          'Enjoy your free product deal!'
        ],
        terms: 'Sourced from Free Stuff Finder. Terms apply per merchant.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 deals from feed.');
    return deals;
  } catch (err) {
    console.error('Error fetching Free Stuff Finder:', err.message);
    errors.push({ source: 'Free Stuff Finder', error: err.message });
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Multi-Source Freebie Aggregator Scraper...\n');

  const errors = [];
  const redditDeals = await fetchReddit(errors);
  const docDeals = await fetchDoctorOfCredit(errors);
  const fsfDeals = await fetchFreeStuffFinder(errors);

  const allDeals = [...redditDeals, ...docDeals, ...fsfDeals];

  if (allDeals.length > 0) {
    const outputPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
    fs.writeFileSync(outputPath, JSON.stringify(allDeals, null, 2));
    console.log(`\n🎉 Saved ${allDeals.length} total live deals to ${outputPath}`);
  }

  if (errors.length > 0) {
    console.error(`\n⚠️ Scraper finished with ${errors.length} error(s). Sending webhook alert...`);
    await sendWebhookAlert(errors);
  }
}

main();
