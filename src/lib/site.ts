import feedJson from '../data/prices.json';
import planJson from '../data/feed-plan.json';
import { isValidFeed, phoneDisplay, waLink, type Feed, type FeedPlan } from './pricing';

if (!isValidFeed(feedJson)) throw new Error('src/data/prices.json is not a valid price feed');

export const feed = feedJson as unknown as Feed;
export const plan = planJson as FeedPlan;
export const PHONE = phoneDisplay(feed);
export const CHANNEL = 'https://whatsapp.com/channel/0029VbBuyfj0gcfS8vNx7s0e';
export const FEED_URL = 'https://ops.fishtech.co.zw/prices.json';
export const SITE = 'https://fishtech.co.zw';
export const wa = (message: string, tag: string) => waLink(feed, message, tag);
export const HELLO = 'Hi FishTech, I would like a price.';
