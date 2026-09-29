import assert from 'node:assert/strict';
import { syndicationToken, syndicationUrl, collectMedia, pickVariant, buildFilename } from './media.js';

assert.equal(syndicationToken('1578353380363501568'), '3tqjk85bxqa');
assert.match(syndicationToken('2078196054479229358'), /^[0-9a-z]+$/);

const get = async (id) => {
  const res = await fetch(syndicationUrl(id));
  assert.equal(res.status, 200, `syndication for ${id}`);
  return res.json();
};

// recent video tweet: mediaDetails/photos/video keys must dedupe to one entry
const video = await get('2078196054479229358');
const media = collectMedia(video);
assert.equal(media.length, 1, 'duplicate media keys deduped');
const best = pickVariant(media[0]);
assert.equal(best.content_type, 'video/mp4');
assert.equal(best.bitrate, 10368000, 'highest bitrate wins over 2176000');
assert.match(best.url, /\/1920x1080\//);

// gif tweet: single direct mp4
const gif = await get('2089864209320329501');
const g = pickVariant(collectMedia(gif)[0]);
assert.match(g.url, /tweet_video\/.+\.mp4$/);
assert.equal(g.bitrate, 0);

// older ext_tw_video with query string in variant urls
const old = await get('1578353380363501568');
const ob = pickVariant(collectMedia(old)[0]);
assert.equal(ob.bitrate, 1280000);

assert.match(
  buildFilename(video, best),
  /^X\/[A-Za-z0-9_.-]+_2078196054479229358_1920x1080\.mp4$/
);
assert.match(buildFilename(gif, g), /^X\/[A-Za-z0-9_.-]+_2089864209320329501\.mp4$/);

console.log('all ok');
