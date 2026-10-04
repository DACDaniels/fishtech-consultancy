// Builds the Zimbabwe map at build time from public-domain Natural Earth data
// (world-atlas). Town positions are approximate and used for drawing only;
// distances and prices always come from the price feed.
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import coords from '../data/town-coords.json';
import { bandFor, sortedBands, type Feed } from './pricing';

export interface MapTown { place: string; km: number; band: number; x: number; y: number }

export function buildMap(feed: Feed, width = 640, height = 560) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countries = feature(world as any, (world as any).objects.countries) as any;
  const zim = countries.features.find((f: { id: string }) => f.id === '716');
  if (!zim) throw new Error('Zimbabwe not found in world-atlas');
  const projection = geoMercator().fitExtent([[16, 16], [width - 16, height - 16]], zim);
  const outline = geoPath(projection)(zim) ?? '';
  const bands = sortedBands(feed);
  const table = coords.towns as Record<string, [number, number]>;
  const towns: MapTown[] = feed.towns.flatMap((t) => {
    const c = table[t.place];
    if (!c) return [];
    const p = projection([c[1], c[0]]);
    if (!p) return [];
    const band = bands.indexOf(bandFor(feed, t.km));
    return [{ place: t.place, km: t.km, band, x: Math.round(p[0] * 10) / 10, y: Math.round(p[1] * 10) / 10 }];
  });
  return { width, height, outline, towns, bands };
}
