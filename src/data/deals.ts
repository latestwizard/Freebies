import { Category, Deal } from '../types';
import { STATIC_DEALS } from './staticDeals';
import aggregatedDeals from './aggregatedDeals.json';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Freebies', icon: 'Sparkles', description: 'Browse all verified freebies and perks' },
  { id: 'samples', name: 'Free Samples & Rebates', icon: 'Gift', description: 'Physical sample boxes by mail, 100% cashback rebates, and skincare freebies' },
  { id: 'birthday', name: 'Birthday Freebies', icon: 'Cake', description: 'Free birthday meals, drinks, beauty gifts, and dessert perks' },
  { id: 'tech', name: 'Tech & SaaS', icon: 'Code', description: 'Free cloud credits, dev tools, and AI subscriptions' },
  { id: 'finance', name: 'Finance & Perks', icon: 'Coins', description: 'Cashback signups, bonus stocks, and referral rewards' },
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', description: 'Free birthday meals, delivery credits, and coffee perks' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv', description: 'Free streaming trials, gaming passes, and audiobooks' }
];

export const INITIAL_DEALS: Deal[] = [
  ...STATIC_DEALS,
  ...(aggregatedDeals as Deal[])
];
