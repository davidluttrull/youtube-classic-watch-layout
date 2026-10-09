# YouTube Classic Watch Layout

In October 2026 YouTube started moving the description and comments on desktop watch pages into a sidebar, with recommendations shown as a grid under the video. This script puts things back the way they were:

- Title, description, and comments sit under the video
- Recommendations are back in the right-hand column
- The new Description / Comments / Ask icon strip is removed
- The theater mode button (and the T shortcut) work again

It was written for the custom script feature in [Enhancer for YouTube](https://www.mrfdev.com/enhancer-for-youtube). It's plain JavaScript, so it should also work in a userscript manager or anywhere else that runs code in the YouTube page.

## Install

### Enhancer for YouTube

1. Open Enhancer for YouTube's options.
2. Paste the contents of [`classic-watch-layout.user.js`](classic-watch-layout.user.js) into **Custom script** and save.
3. Reload YouTube with Ctrl+Shift+R (Cmd+Shift+R on a Mac).

### Tampermonkey or Violentmonkey

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open [the raw script](https://raw.githubusercontent.com/davidluttrull/youtube-classic-watch-layout/main/classic-watch-layout.user.js). Your userscript manager will offer to install it.
3. Reload YouTube.

The userscript version picks up updates from this repo on its own.

## How it works

The new layout is controlled by YouTube experiment flags (`web_watch_split_scroll`, `web_watch_fixed_default_panels`, `enable_web_side_rail`, `web_side_rail_dismissible_panels`, and a few related ones). The script:

1. Sets those flags to `false` so pages built later use the classic layout.
2. Switches off the matching properties on the watch page that's already on screen, moves the recommendations back to the right column, and un-hides the comments section under the video. It also turns off `disable_theater_mode`, which hides the theater mode button once the side rail is gone.
3. Re-applies itself on every in-app navigation, since YouTube is a single-page app.

## Known limitations

- The script runs after the page loads, so you may see the new layout for a moment before it switches.
- Comments load as you scroll down to them, the same as in the classic layout.
- I tested this by forcing the new layout's flags on in a browser that didn't have it, not on an account YouTube enrolled directly. YouTube may set yours up differently.
- I've tested it in Enhancer for YouTube and in Tampermonkey on Chrome, but not in Violentmonkey.
- YouTube changes its internals often. If the script stops working, the flag names or element names have probably changed. Please open an issue.

## License

[MIT](LICENSE)
