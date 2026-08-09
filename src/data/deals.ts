import { Category, Deal } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Freebies', icon: 'Sparkles', description: 'Browse all verified freebies and perks' },
  { id: 'tech', name: 'Tech & SaaS', icon: 'Code', description: 'Free cloud credits, dev tools, and AI subscriptions' },
  { id: 'finance', name: 'Finance & Perks', icon: 'Coins', description: 'Cashback signups, bonus stocks, and referral rewards' },
  { id: 'samples', name: 'Free Samples', icon: 'Gift', description: 'Physical sample boxes, grooming, and household items' },
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', description: 'Free birthday meals, delivery credits, and coffee perks' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv', description: 'Free streaming trials, gaming passes, and audiobooks' }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'digitalocean-credits',
    title: '$200 Cloud Hosting Credits',
    provider: 'DigitalOcean',
    logoText: 'DO',
    logoBg: 'linear-gradient(135deg, #0080FF, #0055B3)',
    category: 'tech',
    shortDesc: 'Get $200 in free cloud hosting credits valid for 60 days to spin up VPS instances, databases, or Kubernetes clusters.',
    fullDesc: 'DigitalOcean gives new users $200 in credit to build, test, and scale applications on their developer-friendly cloud platform. Deploy Droplets, Managed Databases, App Platform, and S3-compatible Object Storage completely free.',
    valueText: '$200 Free Credit',
    referralUrl: 'https://m.do.co/c/freebie_referral_demo',
    promoCode: 'DO200BONUS',
    upvotes: 342,
    claimsCount: 1890,
    verifiedDate: 'Today',
    badge: 'HOT',
    featured: true,
    steps: [
      'Click the "Claim Freebie" button below to open DigitalOcean using our verified referral link.',
      'Sign up for a new DigitalOcean account with your email or GitHub.',
      'Add a valid payment method (credit card or PayPal) for verification — you will not be charged.',
      'Your $200 credit will automatically apply to your account balance for 60 days.'
    ],
    terms: 'Valid for new DigitalOcean accounts only. $200 credit expires 60 days after activation. We may earn account credits if you convert to a paid user.'
  },
  {
    id: 'notion-plus-ai',
    title: 'Notion Plus & AI Credits',
    provider: 'Notion',
    logoText: 'N',
    logoBg: 'linear-gradient(135deg, #111111, #333333)',
    category: 'tech',
    shortDesc: 'Unlock Notion Plus tier for startups and students, including unlimited AI Q&A and unlimited file uploads.',
    fullDesc: 'Organize your work, docs, and projects with Notion. Claim $1,000 in startup credits or free student upgrade to access Notion AI capabilities, unlimited workspace history, and team collaboration tools.',
    valueText: '$1,000 Value',
    referralUrl: 'https://notion.so/signup?referral=freebies_hub',
    upvotes: 289,
    claimsCount: 1450,
    verifiedDate: 'Yesterday',
    badge: 'FEATURED',
    featured: true,
    steps: [
      'Navigate to Notion using the referral link.',
      'Sign up using an eligible startup email domain (.edu or registered startup domain).',
      'Navigate to Settings & Members > Plans > Apply Promo Code.',
      'Enjoy 6 months of free Notion Plus + AI addon.'
    ],
    terms: 'Terms apply per Notion startup program eligibility. Referral links earn community points.'
  },
  {
    id: 'sofi-checking-bonus',
    title: '$300 Direct Deposit Cash Bonus',
    provider: 'SoFi Banking',
    logoText: 'SoFi',
    logoBg: 'linear-gradient(135deg, #00A3A6, #005F63)',
    category: 'finance',
    shortDesc: 'Get up to $300 in cash when you open a SoFi Checking & Savings account and set up direct deposit.',
    fullDesc: 'SoFi offers 4.60% APY on savings with no account fees. Sign up via our referral link to claim a $25 instant signup bonus + up to $300 cash when you receive direct deposits within 25 days.',
    valueText: '$325 Total Cash',
    referralUrl: 'https://www.sofi.com/invite/money?gcp=freebies_referral',
    promoCode: 'SOFI325',
    upvotes: 412,
    claimsCount: 2310,
    verifiedDate: 'Today',
    badge: 'HOT',
    featured: true,
    steps: [
      'Click "Claim Freebie" to open SoFi Bank via referral.',
      'Complete account application for SoFi Checking & Savings in under 5 minutes.',
      'Fund your account with $50+ to instantly receive your initial $25 signup cash bonus.',
      'Set up direct deposit of $1,000+ within 25 days to trigger the additional $300 bonus.'
    ],
    terms: 'Member FDIC. Direct deposit bonus tier based on total deposit amount ($1,000 - $4,999 gets $50; $5,000+ gets $300). Referral reward supported.'
  },
  {
    id: 'pinch-me-sample-box',
    title: 'Free PinchMe Beauty & Snack Box',
    provider: 'PinchMe',
    logoText: 'PM',
    logoBg: 'linear-gradient(135deg, #E91E63, #880E4F)',
    category: 'samples',
    shortDesc: 'Get a monthly box of free samples from top brand names delivered right to your door with free shipping.',
    fullDesc: 'PinchMe lets users sample products from leading brands like Kraft, L\'Oreal, Colgate, and Nestle in exchange for honest feedback. Absolutely zero credit card or subscription required.',
    valueText: '100% Free Box',
    referralUrl: 'https://www.pinchme.com/register?ref=freebies_verse',
    upvotes: 198,
    claimsCount: 940,
    verifiedDate: '3 days ago',
    badge: 'VERIFIED',
    steps: [
      'Sign up for a free PinchMe account.',
      'Complete your member profile survey to match with relevant brand samples.',
      'Select your sample box contents on Sample Tuesday.',
      'Boxes ship to your address completely free!'
    ],
    terms: 'US residents only. Limit 1 box per household per sample drop window.'
  },
  {
    id: 'doordash-free-dashpass',
    title: '3 Months Free DashPass + $15 Credit',
    provider: 'DoorDash',
    logoText: 'DD',
    logoBg: 'linear-gradient(135deg, #FF3008, #B31900)',
    category: 'food',
    shortDesc: 'Enjoy $0 delivery fees and reduced service fees on food delivery for 90 days plus $15 off your first 3 orders.',
    fullDesc: 'Get your favorite restaurants delivered for less. Activate 3 months of complimentary DashPass ($29.97 value) plus receive $5 off each of your first 3 food delivery orders.',
    valueText: '$45 Value',
    referralUrl: 'https://drd.sh/referral/freebies_dash',
    promoCode: 'DASHPASS90',
    upvotes: 310,
    claimsCount: 3100,
    verifiedDate: 'Today',
    badge: 'LIMITED',
    steps: [
      'Click the referral link to download DoorDash or log into your account.',
      'Apply referral code DASHPASS90 at checkout on your first order.',
      'DashPass will automatically activate for 90 days with $0 delivery fees on orders $12+.'
    ],
    terms: 'New DashPass subscribers only. Auto-renews after 3 months unless cancelled in settings.'
  },
  {
    id: 'audible-premium-free',
    title: '30 Days Free Audible Premium Plus',
    provider: 'Amazon Audible',
    logoText: 'AUD',
    logoBg: 'linear-gradient(135deg, #F8991D, #C66E00)',
    category: 'entertainment',
    shortDesc: 'Get 2 free audiobook credits + access to thousands of Audible Originals, podcasts, and audiobooks.',
    fullDesc: 'Listen anywhere with Audible Premium Plus. Claim 30 days free access including 2 free credits that are yours to keep forever even if you cancel your subscription.',
    valueText: '2 Free Audiobooks',
    referralUrl: 'https://www.amazon.com/hz/audible/mlp/membership/premiumplus?tag=freebieshub-20',
    upvotes: 275,
    claimsCount: 1620,
    verifiedDate: 'Today',
    badge: 'VERIFIED',
    steps: [
      'Click the referral link to land on the Amazon Audible signup page.',
      'Sign in with your Amazon account.',
      'Start your 30-day free trial and select 2 free audiobooks.',
      'Download the Audible app on iOS or Android to start listening.'
    ],
    terms: 'Cancel anytime before 30 days to avoid recurring charges. Kept audiobooks remain in your Amazon library permanently.'
  },
  {
    id: 'vercel-pro-credits',
    title: 'Vercel Hobby & AI Gateway Free Tier',
    provider: 'Vercel',
    logoText: 'V',
    logoBg: 'linear-gradient(135deg, #000000, #222222)',
    category: 'tech',
    shortDesc: 'Deploy unlimited frontend web applications with automated SSL, global CDN, and 100k free AI API gateway requests.',
    fullDesc: 'Vercel is the creator of Next.js and leading frontend deployment cloud. Enjoy generous free hobby deployment quotas, custom domains, serverless functions, and free analytics.',
    valueText: 'Unlimited Free Tier',
    referralUrl: 'https://vercel.com/signup?ref=freebies_hub',
    upvotes: 450,
    claimsCount: 4200,
    verifiedDate: 'Today',
    badge: 'EXCLUSIVITY',
    steps: [
      'Click "Claim Freebie" to open Vercel.',
      'Sign up using your GitHub or GitLab account.',
      'Import any Git repository to deploy live within 30 seconds.',
      'Access free SSL certificate and speed insights instantly.'
    ],
    terms: 'Fair use policy applies. Commercial enterprise features require paid plan.'
  },
  {
    id: 'robinhood-free-stock',
    title: 'Free Fractional Stock ($5 - $200)',
    provider: 'Robinhood',
    logoText: 'RH',
    logoBg: 'linear-gradient(135deg, #00C805, #008703)',
    category: 'finance',
    shortDesc: 'Claim a free fractional share of top companies like Apple, Tesla, or Amazon when you open an account.',
    fullDesc: 'Start investing commission-free. Sign up via our referral link and link your bank account to receive a guaranteed free stock share worth up to $200.',
    valueText: 'Up to $200 Stock',
    referralUrl: 'https://join.robinhood.com/freebie_rh',
    upvotes: 380,
    claimsCount: 2800,
    verifiedDate: '2 days ago',
    badge: 'HOT',
    steps: [
      'Click referral link to download Robinhood app.',
      'Complete quick registration and identity verification.',
      'Link bank account to claim your reward gift box.',
      'Pick your free stock from a list of top US tech companies.'
    ],
    terms: 'Reward value randomly assigned: 99% of rewards are between $5 and $10. Must hold stock for 3 trading days before selling.'
  }
];
