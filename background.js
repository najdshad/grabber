import { syndicationUrl, collectMedia, pickVariant, buildFilename } from './media.js';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== 'download') return;
  download(msg).then(sendResponse);
  return true; // keep the channel open for the async response
});

async function download({ tweetId, index }) {
  if (!tweetId) return { ok: false, error: 'no tweet found' };
  try {
    const res = await fetch(syndicationUrl(tweetId));
    if (!res.ok) throw new Error(`syndication HTTP ${res.status}`);
    const json = await res.json();
    const media = collectMedia(json);
    const variant = pickVariant(media[index] ?? media[0]);
    if (!variant) throw new Error('no MP4 variant (tweet may be private)');
    const filename = buildFilename(json, variant);
    await chrome.downloads.download({ url: variant.url, filename });
    return { ok: true, filename };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
