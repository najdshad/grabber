# X Video Downloader

Chrome extension (Manifest V3) that downloads videos and GIFs from X.com as MP4 files.

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Open x.com, click the ⬇ button on any video or GIF

The file is saved to `Downloads/X/<handle>_<tweetId>_<width>x<height>.mp4`.

## How it works

- `content.js` injects a download button on every video player and resolves the
  tweet id / media index from the DOM on click.
- `background.js` fetches X's public syndication API
  (`cdn.syndication.twimg.com/tweet-result`) and picks the highest-bitrate
  progressive MP4 variant (video with audio, up to 4096px — no HLS merging
  needed), then saves it via `chrome.downloads`.
- `media.js` holds the pure logic (syndication token, JSON walk, variant
  selection, filename) shared by the worker and the test.

GIFs are stored by X as MP4 (`video.twimg.com/tweet_video/*.mp4`), so they are
saved as `.mp4` too.

## Test

```
node test.js
```

Fetches live syndication responses for known tweets and asserts token format,
media de-duplication, variant selection and filename building.

## Limitations

- Public tweets only; private/age-gated tweets fail with a toast.
- Multi-video tweets pick media by DOM order (same tweet, worst case a sibling
  video).

## Privacy

No third-party servers. The only network calls are to X's own syndication API
and CDN. Nothing is logged or sent anywhere else.
