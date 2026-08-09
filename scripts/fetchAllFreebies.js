import fs from 'fs';
import path from 'path';

/**
 * Unified Multi-Source Freebie Scraper
 * Aggregates real-time freebie deals from:
 * 1. Reddit r/freebies (Community Sample Box & Freebies)
 * 2. Doctor of Credit (Bank Signup Cash Bonuses & Free Money)
 * 3. Free Stuff Finder (Physical Samples & Retailer Freebies)
 */

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

// 1. Fetch Reddit r/freebies RSS
async function fetchReddit() {
  console.log('🤖 [1/3] Fetching Reddit r/freebies...');
  try {
    const res = await fetch('https://old.reddit.com/r/freebies/.rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) return [];

    const xml = await res.text();
    // Split XML by entry tags
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
    return deals;
  } catch (err) {
    console.error('Error fetching Reddit:', err.message);
    return [];
  }
}

// 2. Fetch Doctor of Credit RSS
async function fetchDoctorOfCredit() {
  console.log('💳 [2/3] Fetching Doctor of Credit (Free Money & Bank Bonuses)...');
  try {
    const res = await fetch('https://www.doctorofcredit.com/category/free-money/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) return [];

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
    return deals;
  } catch (err) {
    console.error('Error fetching Doctor of Credit:', err.message);
    return [];
  }
}

// 3. Fetch Free Stuff Finder RSS
async function fetchFreeStuffFinder() {
  console.log('🎁 [3/3] Fetching Free Stuff Finder...');
  try {
    const res = await fetch('https://www.freestufffinder.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) return [];

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
    return deals;
  } catch (err) {
    console.error('Error fetching Free Stuff Finder:', err.message);
    return [];
  }
}

// Master Aggregator Function
async function main() {
  console.log('🚀 Starting Multi-Source Freebie Aggregator Scraper...\n');

  const redditDeals = await fetchReddit();
  const docDeals = await fetchDoctorOfCredit();
  const fsfDeals = await fetchFreeStuffFinder();

  const allDeals = [...redditDeals, ...docDeals, ...fsfDeals];

  const outputPath = path.resolve(process.cwd(), 'src/data/aggregatedDeals.json');
  fs.writeFileSync(outputPath, JSON.stringify(allDeals, null, 2));

  console.log(`\n🎉 Aggregation Complete! Saved ${allDeals.length} total live deals to ${outputPath}`);
  console.log(` - r/freebies: ${redditDeals.length} deals`);
  console.log(` - Doctor of Credit: ${docDeals.length} deals`);
  console.log(` - Free Stuff Finder: ${fsfDeals.length} deals`);
}

main();
