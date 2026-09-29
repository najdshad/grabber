export function syndicationToken(id) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

export function syndicationUrl(id) {
  return `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${syndicationToken(id)}&lang=en`;
}

// Walks the syndication JSON and collects every media object carrying video_info.
// Deduped by variant URL: syndication repeats the same media under mediaDetails/photos/video keys.
export function collectMedia(json) {
  const seen = new Set();
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    const variants = node.video_info?.variants;
    if (variants?.length) {
      if (!seen.has(variants[0].url)) {
        seen.add(variants[0].url);
        out.push(node);
      }
    }
    Object.values(node).forEach(walk);
  };
  walk(json);
  return out;
}

// Highest-bitrate progressive MP4 (GIFs have a single mp4 variant with bitrate 0).
export function pickVariant(media) {
  const mp4 = (media?.video_info?.variants ?? []).filter((v) => v.content_type === 'video/mp4');
  return mp4.reduce((best, v) => (!best || (v.bitrate || 0) > (best.bitrate || 0) ? v : best), null);
}

export function buildFilename(json, variant) {
  const handle = (json?.user?.screen_name || 'x').replace(/[^\w.-]+/g, '_').slice(0, 40);
  const id = json?.id_str || 'video';
  const res = /\/(\d+x\d+)\//.exec(variant.url)?.[1] ?? '';
  return `X/${handle}_${id}${res ? `_${res}` : ''}.mp4`;
}
