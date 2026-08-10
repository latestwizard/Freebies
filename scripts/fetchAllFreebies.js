import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';

/**
 * Unified Multi-Source Freebie Scraper with Integrity Safeguards & Strict Freebie Filter
 * 
 * Features:
 * 1. Strict Freebie Filter: Only includes genuine 100% freebies, physical samples, cash bonuses, and 100% rebates.
 *    Excludes paid store discounts (e.g. "$17 Shipped at Amazon", "$5.60 Dresses", or "$1 SiriusXM").
 * 2. Fast XML Parser: Uses fast-xml-parser to handle XML nodes, attributes, CDATA, and namespaces cleanly.
 * 3. Deterministic Stable IDs: Uses SHA-256 hash of canonical URLs so IDs remain permanent across daily runs.
 * 4. Real Provenance & Verification: Distinguishes 'source-listed' and 'community-reported' from 'staff-verified'.
 * 5. Non-Destructive Caching: Retains last-known-good source cache if a feed suffers a transient outage.
 * 6. Robust Entity Decoding: Decodes numeric and named HTML entities (&amp;, &#038;, &#8217;, etc.).
 * 7. Webhook Alerts: Notifies Discord/Slack on feed anomalies.
 */

// Ensure cache directory exists
const sourcesDir = path.resolve(process.cwd(), 'src/data/sources');
if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: true,
});

export function generateStableId(prefix, url) {
  if (!url) return `${prefix}-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(url.trim()).digest('hex').substring(0, 12);
  return `${prefix}-${hash}`;
}

export function decodeEntities(str) {
  if (!str) return '';
  let text = typeof str === 'object' && str.__cdata ? str.__cdata : String(str);
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .trim();
}

/**
 * Checks whether an item title/URL represents an actual 100% freebie, sample, bonus, or 100% rebate
 * and is NOT a paid product discount (e.g. "$17 Shipped", "$5.60", or "$1 SiriusXM").
 */
export function isGenuineFreebie(title, link = '') {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  const lowerLink = link.toLowerCase();

  // Explicitly reject expired, non-freebie, or paid promotion items
  if (lowerTitle.includes('expired') || lowerTitle.includes('do electronic wallets') || lowerTitle.includes('waiver') || lowerLink.includes('for-1-')) {
    return false;
  }

  // If the title contains a paid dollar price (e.g. "$17", "$5.60", "$1.24", "$1") without explicit "100% free" or "rebate", reject it
  if (/\$[\d.]+\s*(shipped|at amazon|at walmart|at target|for\s+\$)/i.test(title) &&
      !lowerTitle.includes('100% free') && !lowerTitle.includes('free after rebate') && !lowerTitle.includes('free credit') && !lowerTitle.includes('free bonus')) {
    return false;
  }

  // Must match genuine freebie indicators
  return lowerTitle.includes('free') ||
         lowerTitle.includes('sample') ||
         lowerTitle.includes('freebie') ||
         lowerTitle.includes('rebate') ||
         lowerTitle.includes('bonus') ||
         lowerTitle.includes('giveaway') ||
         lowerTitle.includes('complimentary');
}

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
            title: '🚨 Scraper Source Alert',
            description: `Feed anomaly or outage encountered:\n\n${errorDetails}`,
            color: 15158332,
            timestamp: new Date().toISOString(),
          },
        ],
      }
    : {
        text: `🚨 *FreebieVerse Scraper Alert*\nFeed anomaly or outage encountered:\n${errorDetails}`,
      };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      console.log('✅ Sent webhook alert successfully.');
    } else {
      console.error(`❌ Webhook notification failed with status ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Failed to dispatch webhook notification:', err.message);
  }
}

// 1. Fetch Reddit r/freebies Atom Feed
export async function fetchReddit(errors) {
  const cachePath = path.join(sourcesDir, 'reddit.json');
  console.log('🤖 [1/3] Parsing Reddit r/freebies Atom XML feed...');

  try {
    const res = await fetch('https://old.reddit.com/r/freebies/.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xmlText = await res.text();
    const parsedObj = xmlParser.parse(xmlText);

    const entries = parsedObj?.feed?.entry
      ? (Array.isArray(parsedObj.feed.entry) ? parsedObj.feed.entry : [parsedObj.feed.entry])
      : [];

    const deals = [];

    for (const entry of entries) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(entry.title);
      let link = '';
      if (typeof entry.link === 'string') {
        link = entry.link;
      } else if (entry.link && entry.link['@_href']) {
        link = entry.link['@_href'];
      }

      const updated = entry.updated ? String(entry.updated) : new Date().toISOString();

      if (!rawTitle || !link) continue;
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const cleanTitle = rawTitle.replace(/^\[.*?\]\s*/, '').trim();
      const stableId = generateStableId('reddit', link);

      deals.push({
        id: stableId,
        title: cleanTitle.length > 65 ? cleanTitle.substring(0, 62) + '...' : cleanTitle,
        provider: 'r/freebies Community',
        logoText: 'RED',
        logoBg: 'linear-gradient(135deg, #FF4500, #CC3700)',
        category: 'samples',
        shortDesc: cleanTitle,
        fullDesc: `${cleanTitle}. Community reported on Reddit r/freebies.`,
        valueText: '100% Free Sample',
        referralUrl: link,
        sourceUrl: link,
        status: 'verified',
        verificationStatus: 'community-reported',
        source: 'reddit',
        createdAt: updated.split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'REDDIT',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open the community discussion and direct sample link.',
          'Follow the provider form instructions to request your sample.',
          'Allow standard delivery time for physical items.'
        ],
        terms: 'Community reported offer on Reddit r/freebies. Provider terms apply.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Reddit Atom feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err) {
    console.error('⚠️ Error fetching Reddit, falling back to cache:', err.message);
    errors.push({ source: 'Reddit r/freebies', error: err.message });

    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Reddit.`);
        return filteredCached;
      } catch (cacheErr) {
        console.error('Failed to read Reddit cache:', cacheErr.message);
      }
    }
    return [];
  }
}

// 2. Fetch Doctor of Credit RSS 2.0 Feed
export async function fetchDoctorOfCredit(errors) {
  const cachePath = path.join(sourcesDir, 'doc.json');
  console.log('💳 [2/3] Parsing Doctor of Credit RSS 2.0 XML feed...');

  try {
    const res = await fetch('https://www.doctorofcredit.com/category/free-money/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xmlText = await res.text();
    const parsedObj = xmlParser.parse(xmlText);

    const items = parsedObj?.rss?.channel?.item
      ? (Array.isArray(parsedObj.rss.channel.item) ? parsedObj.rss.channel.item : [parsedObj.rss.channel.item])
      : [];

    const deals = [];

    for (const item of items) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(item.title);
      const link = typeof item.link === 'string' ? item.link : String(item.link || '');
      const pubDate = item.pubDate ? String(item.pubDate) : new Date().toISOString();

      if (!rawTitle || !link) continue;
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const stableId = generateStableId('doc', link);

      deals.push({
        id: stableId,
        title: rawTitle.length > 65 ? rawTitle.substring(0, 62) + '...' : rawTitle,
        provider: 'Doctor of Credit',
        logoText: 'DOC',
        logoBg: 'linear-gradient(135deg, #0284C7, #0369A1)',
        category: 'finance',
        shortDesc: rawTitle,
        fullDesc: `${rawTitle}. Curated by Doctor of Credit deal editors.`,
        valueText: 'Cash Bonus / Perk',
        referralUrl: link,
        sourceUrl: link,
        status: 'verified',
        verificationStatus: 'source-listed',
        source: 'doc',
        createdAt: new Date(pubDate).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'DOC',
        featured: true,
        steps: [
          'Click "Claim Freebie" to open Doctor of Credit\'s offer analysis.',
          'Review eligibility requirements and terms.',
          'Follow provider links to complete signup.'
        ],
        terms: 'Curated by Doctor of Credit. Terms apply per financial institution.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Doctor of Credit RSS feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err) {
    console.error('⚠️ Error fetching Doctor of Credit, falling back to cache:', err.message);
    errors.push({ source: 'Doctor of Credit', error: err.message });

    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Doctor of Credit.`);
        return filteredCached;
      } catch (cacheErr) {
        console.error('Failed to read DoC cache:', cacheErr.message);
      }
    }
    return [];
  }
}

// 3. Fetch Free Stuff Finder RSS 2.0 Feed
export async function fetchFreeStuffFinder(errors) {
  const cachePath = path.join(sourcesDir, 'fsf.json');
  console.log('🎁 [3/3] Parsing Free Stuff Finder RSS 2.0 XML feed...');

  try {
    const res = await fetch('https://www.freestufffinder.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const xmlText = await res.text();
    const parsedObj = xmlParser.parse(xmlText);

    const items = parsedObj?.rss?.channel?.item
      ? (Array.isArray(parsedObj.rss.channel.item) ? parsedObj.rss.channel.item : [parsedObj.rss.channel.item])
      : [];

    const deals = [];

    for (const item of items) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(item.title);
      const link = typeof item.link === 'string' ? item.link : String(item.link || '');
      const pubDate = item.pubDate ? String(item.pubDate) : new Date().toISOString();

      if (!rawTitle || !link) continue;
      // Strictly enforce genuine freebies only — reject paid products/discounts!
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const stableId = generateStableId('fsf', link);

      deals.push({
        id: stableId,
        title: rawTitle.length > 65 ? rawTitle.substring(0, 62) + '...' : rawTitle,
        provider: 'Free Stuff Finder',
        logoText: 'FSF',
        logoBg: 'linear-gradient(135deg, #EC4899, #BE185D)',
        category: 'samples',
        shortDesc: rawTitle,
        fullDesc: `${rawTitle}. Curated by Free Stuff Finder bargain editors.`,
        valueText: '100% Freebie',
        referralUrl: link,
        sourceUrl: link,
        status: 'verified',
        verificationStatus: 'source-listed',
        source: 'fsf',
        createdAt: new Date(pubDate).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        badge: 'FSF',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open Free Stuff Finder offer page.',
          'Follow the free sample or discount instructions.',
          'Claim your offer directly from the merchant.'
        ],
        terms: 'Sourced from Free Stuff Finder. Terms apply per merchant.'
      });
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Free Stuff Finder RSS feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err) {
    console.error('⚠️ Error fetching Free Stuff Finder, falling back to cache:', err.message);
    errors.push({ source: 'Free Stuff Finder', error: err.message });

    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Free Stuff Finder.`);
        return filteredCached;
      } catch (cacheErr) {
        console.error('Failed to read FSF cache:', cacheErr.message);
      }
    }
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Multi-Source Freebie Aggregator Scraper (Strict Freebies Only)...\n');

  const errors = [];
  const redditDeals = await fetchReddit(errors);
  const docDeals = await fetchDoctorOfCredit(errors);
  const fsfDeals = await fetchFreeStuffFinder(errors);

  const allDeals = [...redditDeals, ...docDeals, ...fsfDeals];

  if (allDeals.length > 0) {
    const outputPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
    fs.writeFileSync(outputPath, JSON.stringify(allDeals, null, 2));
    console.log(`\n🎉 Saved ${allDeals.length} total 100% genuine freebie deals to ${outputPath}`);
  } else {
    console.error('\n❌ All sources failed and no cache available! Skipping aggregatedDeals.json overwrite.');
  }

  if (errors.length > 0) {
    console.error(`\n⚠️ Scraper finished with ${errors.length} warning/error(s). Dispatching webhook alert...`);
    await sendWebhookAlert(errors);
  }
}

// Only execute main when run directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
