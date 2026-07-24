// const DEFAULT_APP_BASE_URL = 'https://qa.done.deals';
const DEFAULT_APP_BASE_URL = 'https://app.done.deals';

export const APP_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL || DEFAULT_APP_BASE_URL
).replace(/\/+$/, '');

export function appUrl(path) {
  return `${APP_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}
