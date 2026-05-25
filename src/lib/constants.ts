/**
 * Brand-level constants.
 *
 * All recordings shown on the site originate from a single YouTube channel.
 * Hardcoding any of these URLs in a component is a bug — import from here.
 */

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@almaconsort';
export const YOUTUBE_CHANNEL_HANDLE = '@almaconsort';

export const YOUTUBE_THUMB = (id: string): string =>
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export const YOUTUBE_WATCH = (id: string): string =>
  `https://www.youtube.com/watch?v=${id}`;

export const YOUTUBE_EMBED = (id: string): string =>
  `https://www.youtube.com/embed/${id}`;
