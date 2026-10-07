// ==UserScript==
// @name         YouTube Classic Watch Layout
// @namespace    https://github.com/davidluttrull/youtube-classic-watch-layout
// @version      1.0.1
// @description  Puts the description and comments back under the video and recommendations back in the right column.
// @author       David Luttrull
// @license      MIT
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-idle
// @homepageURL  https://github.com/davidluttrull/youtube-classic-watch-layout
// @downloadURL  https://raw.githubusercontent.com/davidluttrull/youtube-classic-watch-layout/main/classic-watch-layout.user.js
// @updateURL    https://raw.githubusercontent.com/davidluttrull/youtube-classic-watch-layout/main/classic-watch-layout.user.js
// ==/UserScript==

// Restore classic YouTube watch layout: description + comments under the video,
// recommendations back in the right-hand column, no side rail.
// For Enhancer for YouTube > Custom script.
(function () {
  if (window.__classicWatchLayout) return;
  window.__classicWatchLayout = true;

  // Experiment flags behind the 2026 "side rail" watch page.
  const OFF_FLAGS = [
    'web_watch_split_scroll',
    'swatcheroo_split_scroll',
    'web_watch_fixed_default_panels',
    'web_fixed_panel_watch_next',
    'web_fixed_panel_watch_next_grid_swap',
    'enable_web_side_rail',
    'web_side_rail_dismissible_panels',
    'web_side_rail_default_dismissed_panels',
    'web_side_rail_with_border',
  ];

  function patchFlags() {
    const stores = [];
    try { if (window.ytcfg && ytcfg.get) stores.push(ytcfg.get('EXPERIMENT_FLAGS')); } catch (e) {}
    try { if (window.yt && yt.config_) stores.push(yt.config_.EXPERIMENT_FLAGS); } catch (e) {}
    for (const flags of stores) {
      if (!flags) continue;
      for (const k of OFF_FLAGS) if (flags[k]) flags[k] = false;
    }
  }

  let switched = false;

  // The new layout hides the regular comments section under the video.
  function showComments() {
    const c = document.querySelector('ytd-watch-flexy ytd-comments#comments');
    if (c && c.hidden && c.data) {
      c.hidden = false;
      // Nudge YouTube to notice the section is visible so it loads comments.
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
  }

  function fixFlexy() {
    const f = document.querySelector('ytd-watch-flexy');
    if (!f) return;
    if (switched) showComments();
    const isNewLayout =
      f.fixedDefaultPanels || f.sideRailDismissiblePanels || f.fixedPanelWatchNext ||
      f.splitScroll || f.showFixedSideMenu || f.fixedSideMenu ||
      f.hasAttribute('split-scroll') || f.hasAttribute('show-fixed-side-menu');
    if (!isNewLayout) return;
    switched = true;

    try {
      f.sideRailDismissiblePanels = false;
      f.fixedPanelWatchNext = false;
      f.fixedDefaultPanels = false;   // turns off usingFixedPanel
      f.fixedSideMenu = null;         // removes the Description/Comments/Ask rail
      if (typeof f._setProperty === 'function') f._setProperty('splitScroll', false);
      else f.splitScroll = false;
    } catch (e) { console.warn('[classic layout]', e); }

    // Belt and braces: strip the reflected attributes the new CSS keys off.
    ['split-scroll', 'using-fixed-panel', 'fixed-default-panels', 'show-fixed-side-menu',
     'side-rail-dismissible-panels', 'fixed-panel-watch-next', 'side-rail-with-border']
      .forEach(a => f.removeAttribute(a));

    // Put recommendations back in the right column.
    try {
      if (typeof f.updateWatchFeedLocation === 'function') f.updateWatchFeedLocation(f.isTwoColumns_);
    } catch (e) {}
    const related = document.querySelector('ytd-watch-flexy #related');
    const secondaryInner = document.querySelector('ytd-watch-flexy #secondary-inner');
    if (f.isTwoColumns_ && related && secondaryInner && !secondaryInner.contains(related)) {
      secondaryInner.appendChild(related);
    }

    // Close any description/comments panel left open in the sidebar.
    document.querySelectorAll(
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"],' +
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-structured-description"]'
    ).forEach(p => p.setAttribute('visibility', 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'));

    showComments();

    // The player keeps the new layout's width until something resizes it.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }

  function run() {
    patchFlags();
    fixFlexy();
  }

  run();
  // Re-apply on every in-app navigation and as late page data arrives.
  ['yt-navigate-start', 'yt-navigate-finish', 'yt-page-data-updated'].forEach(ev =>
    document.addEventListener(ev, () => { run(); setTimeout(run, 500); setTimeout(run, 1500); })
  );
  // YouTube sometimes re-applies the layout after load; keep an eye on the attribute.
  let queued = false;
  const runSoon = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; run(); });
  };
  new MutationObserver(runSoon).observe(document.documentElement, {
    subtree: true, attributes: true,
    attributeFilter: ['split-scroll', 'show-fixed-side-menu', 'using-fixed-panel', 'hidden'],
  });
})();
