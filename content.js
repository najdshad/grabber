let busy = false;

// Innermost ancestor owning a /status/ link = the tweet the video belongs to
// (so videos inside quoted tweets resolve to the quoted tweet id).
function statusId(el) {
  for (let n = el; n; n = n.parentElement) {
    const m = n.querySelector?.('a[href*="/status/"]')?.href.match(/\/status\/(\d+)/);
    if (m) return m[1];
  }
  return null;
}

const ARROW =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg>';

function addButtons() {
  for (const v of document.querySelectorAll('article video')) {
    const box = v.closest('[data-testid="videoPlayer"]') || v.parentElement;
    if (!box || box.querySelector(':scope > .xvd-btn')) continue;
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';

    const btn = document.createElement('button');
    btn.className = 'xvd-btn';
    btn.title = 'Download video';
    btn.innerHTML = ARROW;
    btn.style.cssText =
      'position:absolute;top:8px;right:8px;z-index:10;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.75;transition:opacity .15s';
    btn.onmouseenter = () => (btn.style.opacity = '1');
    btn.onmouseleave = () => (btn.style.opacity = '.75');

    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      busy = true;
      btn.disabled = true;
      const scope = v.closest('article') || document;
      // ponytail: multi-video tweets matched by DOM order, not by media id
      const r = await chrome.runtime
        .sendMessage({ type: 'download', tweetId: statusId(v), index: [...scope.querySelectorAll('video')].indexOf(v) })
        .catch((err) => ({ ok: false, error: err.message }));
      toast(r?.ok ? `Saved ${r.filename ?? ''}`.trim() : `Download failed: ${r?.error ?? 'no response'}`);
      btn.disabled = false;
      busy = false;
    };

    box.appendChild(btn);
  }
}

function toast(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText =
    'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9999;background:#1d1f23;color:#fff;padding:8px 14px;border-radius:6px;font:13px/1.4 system-ui;box-shadow:0 2px 8px rgba(0,0,0,.4)';
  document.documentElement.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

addButtons();
// ponytail: interval instead of MutationObserver — X virtualizes its timeline,
// a 1s rescan catches every mount/remount with less code
setInterval(addButtons, 1000);
