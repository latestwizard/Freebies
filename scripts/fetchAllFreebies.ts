import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import { Deal, CategoryId, ProvenanceSource, VerificationStatus } from '../src/types';

/**
 * Unified Multi-Source Freebie Scraper (TypeScript)
 * 
 * Features:
 * 1. Convert Scraper to TypeScript: Full type safety for Deal interfaces.
 * 2. Fetch Timeout & Exponential Retry: Network requests use AbortController with 8s timeout & exponential backoff.
 * 3. Cross-Source Deduplication: Deduplicates offers across Doctor of Credit, FSF, and Reddit by URL & title.
 * 4. Schema Validation: Validates parsed objects against required Deal schema properties before publishing.
 * 5. ISO Date Normalization: Ensures createdAt, verifiedAt, and dates use standard YYYY-MM-DD format.
 * 6. Non-Destructive Caching: Retains last-known-good source dataset on network failure.
 */

interface SourceError {
  source: string;
  error: string;
}

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

export function generateStableId(prefix: string, url: string): string {
  if (!url) return `${prefix}-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(url.trim()).digest('hex').substring(0, 12);
  return `${prefix}-${hash}`;
}

export function decodeEntities(str: unknown): string {
  if (!str) return '';
  let text = typeof str === 'object' && str !== null && '__cdata' in str 
    ? (str as { __cdata: string }).__cdata 
    : String(str);

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

export function normalizeIsoDate(dateInput?: string): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  try {
    const parsed = new Date(dateInput);
    if (isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
    return parsed.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function isGenuineFreebie(title: string, link: string = ''): boolean {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  const lowerLink = link.toLowerCase();

  if (lowerTitle.includes('expired') || lowerTitle.includes('do electronic wallets') || lowerTitle.includes('waiver') || lowerLink.includes('for-1-')) {
    return false;
  }

  if (/\$[\d.]+\s*(shipped|at amazon|at walmart|at target|for\s+\$)/i.test(title) &&
      !lowerTitle.includes('100% free') && !lowerTitle.includes('free after rebate') && !lowerTitle.includes('free credit') && !lowerTitle.includes('free bonus')) {
    return false;
  }

  return lowerTitle.includes('free') ||
         lowerTitle.includes('sample') ||
         lowerTitle.includes('freebie') ||
         lowerTitle.includes('rebate') ||
         lowerTitle.includes('bonus') ||
         lowerTitle.includes('giveaway') ||
         lowerTitle.includes('complimentary');
}

export function validateDealSchema(deal: Partial<Deal>): deal is Deal {
  return typeof deal.id === 'string' &&
         deal.id.length > 0 &&
         typeof deal.title === 'string' &&
         deal.title.length > 0 &&
         typeof deal.provider === 'string' &&
         typeof deal.referralUrl === 'string' &&
         deal.referralUrl.startsWith('http') &&
         typeof deal.category === 'string';
}

export function deduplicateDeals(deals: Deal[]): Deal[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Deal[] = [];

  for (const deal of deals) {
    const normUrl = deal.referralUrl.toLowerCase().replace(/\/$/, '');
    const normTitle = deal.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (seenUrls.has(normUrl) || seenTitles.has(normTitle)) {
      continue;
    }

    seenUrls.add(normUrl);
    seenTitles.add(normTitle);
    unique.push(deal);
  }

  return unique;
}

export async function fetchWithRetry(url: string, maxRetries = 3, timeoutMs = 8000): Promise<string> {
  let lastError: Error = new Error('Unknown fetch failure');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      return await res.text();
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`⚠️ Fetch attempt ${attempt}/${maxRetries} failed for ${url}: ${lastError.message}`);

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError;
}

async function sendWebhookAlert(errors: SourceError[]): Promise<void> {
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Failed to dispatch webhook notification:', msg);
  }
}

// 1. Fetch Reddit r/freebies Atom Feed
export async function fetchReddit(errors: SourceError[]): Promise<Deal[]> {
  const cachePath = path.join(sourcesDir, 'reddit.json');
  console.log('🤖 [1/3] Parsing Reddit r/freebies Atom XML feed...');

  try {
    const xmlText = await fetchWithRetry('https://old.reddit.com/r/freebies/.rss');
    const parsedObj = xmlParser.parse(xmlText);

    const entries = parsedObj?.feed?.entry
      ? (Array.isArray(parsedObj.feed.entry) ? parsedObj.feed.entry : [parsedObj.feed.entry])
      : [];

    const deals: Deal[] = [];

    for (const entry of entries) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(entry.title);
      let link = '';
      if (typeof entry.link === 'string') {
        link = entry.link;
      } else if (entry.link && entry.link['@_href']) {
        link = entry.link['@_href'];
      }

      const updatedDate = normalizeIsoDate(entry.updated ? String(entry.updated) : undefined);

      if (!rawTitle || !link) continue;
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const cleanTitle = rawTitle.replace(/^\[.*?\]\s*/, '').trim();
      const stableId = generateStableId('reddit', link);

      const candidate: Deal = {
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
        createdAt: updatedDate,
        badge: 'REDDIT',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open the community discussion and direct sample link.',
          'Follow the provider form instructions to request your sample.',
          'Allow standard delivery time for physical items.'
        ],
        terms: 'Community reported offer on Reddit r/freebies. Provider terms apply.'
      };

      if (validateDealSchema(candidate)) {
        deals.push(candidate);
      }
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Reddit Atom feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('⚠️ Error fetching Reddit, falling back to cache:', msg);
    errors.push({ source: 'Reddit r/freebies', error: msg });

    if (fs.existsSync(cachePath)) {
      try {
        const cached: Deal[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl) && validateDealSchema(d));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Reddit.`);
        return filteredCached;
      } catch (cacheErr: unknown) {
        const cMsg = cacheErr instanceof Error ? cacheErr.message : String(cacheErr);
        console.error('Failed to read Reddit cache:', cMsg);
      }
    }
    return [];
  }
}

// 2. Fetch Doctor of Credit RSS 2.0 Feed
export async function fetchDoctorOfCredit(errors: SourceError[]): Promise<Deal[]> {
  const cachePath = path.join(sourcesDir, 'doc.json');
  console.log('💳 [2/3] Parsing Doctor of Credit RSS 2.0 XML feed...');

  try {
    const xmlText = await fetchWithRetry('https://www.doctorofcredit.com/category/free-money/feed/');
    const parsedObj = xmlParser.parse(xmlText);

    const items = parsedObj?.rss?.channel?.item
      ? (Array.isArray(parsedObj.rss.channel.item) ? parsedObj.rss.channel.item : [parsedObj.rss.channel.item])
      : [];

    const deals: Deal[] = [];

    for (const item of items) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(item.title);
      const link = typeof item.link === 'string' ? item.link : String(item.link || '');
      const pubDate = normalizeIsoDate(item.pubDate ? String(item.pubDate) : undefined);

      if (!rawTitle || !link) continue;
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const stableId = generateStableId('doc', link);

      const candidate: Deal = {
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
        createdAt: pubDate,
        badge: 'DOC',
        featured: true,
        steps: [
          'Click "Claim Freebie" to open Doctor of Credit\'s offer analysis.',
          'Review eligibility requirements and terms.',
          'Follow provider links to complete signup.'
        ],
        terms: 'Curated by Doctor of Credit. Terms apply per financial institution.'
      };

      if (validateDealSchema(candidate)) {
        deals.push(candidate);
      }
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Doctor of Credit RSS feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('⚠️ Error fetching Doctor of Credit, falling back to cache:', msg);
    errors.push({ source: 'Doctor of Credit', error: msg });

    if (fs.existsSync(cachePath)) {
      try {
        const cached: Deal[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl) && validateDealSchema(d));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Doctor of Credit.`);
        return filteredCached;
      } catch (cacheErr: unknown) {
        const cMsg = cacheErr instanceof Error ? cacheErr.message : String(cacheErr);
        console.error('Failed to read DoC cache:', cMsg);
      }
    }
    return [];
  }
}

// 3. Fetch Free Stuff Finder RSS 2.0 Feed
export async function fetchFreeStuffFinder(errors: SourceError[]): Promise<Deal[]> {
  const cachePath = path.join(sourcesDir, 'fsf.json');
  console.log('🎁 [3/3] Parsing Free Stuff Finder RSS 2.0 XML feed...');

  try {
    const xmlText = await fetchWithRetry('https://www.freestufffinder.com/feed/');
    const parsedObj = xmlParser.parse(xmlText);

    const items = parsedObj?.rss?.channel?.item
      ? (Array.isArray(parsedObj.rss.channel.item) ? parsedObj.rss.channel.item : [parsedObj.rss.channel.item])
      : [];

    const deals: Deal[] = [];

    for (const item of items) {
      if (deals.length >= 6) break;

      const rawTitle = decodeEntities(item.title);
      const link = typeof item.link === 'string' ? item.link : String(item.link || '');
      const pubDate = normalizeIsoDate(item.pubDate ? String(item.pubDate) : undefined);

      if (!rawTitle || !link) continue;
      if (!isGenuineFreebie(rawTitle, link)) continue;

      const stableId = generateStableId('fsf', link);

      const candidate: Deal = {
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
        createdAt: pubDate,
        badge: 'FSF',
        featured: false,
        steps: [
          'Click "Claim Freebie" to open Free Stuff Finder offer page.',
          'Follow the free sample or discount instructions.',
          'Claim your offer directly from the merchant.'
        ],
        terms: 'Sourced from Free Stuff Finder. Terms apply per merchant.'
      };

      if (validateDealSchema(candidate)) {
        deals.push(candidate);
      }
    }

    if (deals.length === 0) throw new Error('Parsed 0 valid deals from Free Stuff Finder RSS feed.');

    fs.writeFileSync(cachePath, JSON.stringify(deals, null, 2));
    return deals;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('⚠️ Error fetching Free Stuff Finder, falling back to cache:', msg);
    errors.push({ source: 'Free Stuff Finder', error: msg });

    if (fs.existsSync(cachePath)) {
      try {
        const cached: Deal[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const filteredCached = cached.filter(d => isGenuineFreebie(d.title, d.referralUrl) && validateDealSchema(d));
        console.log(`📦 Loaded ${filteredCached.length} last-known-good deals for Free Stuff Finder.`);
        return filteredCached;
      } catch (cacheErr: unknown) {
        const cMsg = cacheErr instanceof Error ? cacheErr.message : String(cacheErr);
        console.error('Failed to read FSF cache:', cMsg);
      }
    }
    return [];
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Multi-Source Freebie Aggregator Scraper (TypeScript + Retries + Deduplication)...\n');

  const errors: SourceError[] = [];
  const redditDeals = await fetchReddit(errors);
  const docDeals = await fetchDoctorOfCredit(errors);
  const fsfDeals = await fetchFreeStuffFinder(errors);

  const rawDeals = [...redditDeals, ...docDeals, ...fsfDeals];
  const uniqueDeals = deduplicateDeals(rawDeals);

  if (uniqueDeals.length > 0) {
    const outputPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueDeals, null, 2));
    console.log(`\n🎉 Saved ${uniqueDeals.length} unique 100% genuine freebie deals to ${outputPath}`);
  } else {
    console.error('\n❌ All sources failed and no cache available! Skipping aggregatedDeals.json overwrite.');
  }

  if (errors.length > 0) {
    console.error(`\n⚠️ Scraper finished with ${errors.length} warning/error(s). Dispatching webhook alert...`);
    await sendWebhookAlert(errors);
  }
}

// Only execute main when run directly from command line
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('fetchAllFreebies.ts')) {
  main();
}
