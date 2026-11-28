# Family wall display - tap-through demo (REVIEW)

A static, interactive demo of the family wall display screens. Example data only. No backend, no real accounts, no network calls (fonts and images are local). Label: REVIEW. The on-screen chip says DRAFT - EXAMPLE DATA on purpose.

## Open it

- Serve this folder from any static host or subfolder (for example GitHub Pages). Every path is relative, so `index.html` works from any subfolder.
- You can also open `index.html` straight from disk.
- On an iPad: open the link in Safari, tap Share, then Add to Home Screen. It opens full screen with no browser bars.
- Rotate the iPad and the layout switches live between landscape and portrait, with no reload. Your place (screen, open card, tour step, PIN pad, settings) is kept. If it does not rotate, turn off Rotation Lock in Control Center.

## Demo PIN

The demo PIN is **1234**. Every PIN pad accepts it (approve, decline, show budget amounts, settings). Any other PIN is rejected with a message. Nothing is checked on a server because there is no server.

## Guided tour

Tap **Start demo** on the welcome card, or open the demo menu and tap **Start the guided tour**. It walks through today's schedule, tapping an agent card, asking the concierge, approving with the PIN, the over $150 rule, the budget reveal, quiet hours, offline mode, and renaming the concierge and picking a voice. Back, Skip this step and Exit tour are always there. The coach marks move with the screen when you rotate.

## Demo menu (demo only)

Tap the faint three dots in the top right corner, or press and hold the clock for about a second. The panel is labelled DEMO ONLY and is not part of the wall display.

- Start or restart the guided tour
- Theme: light or dark
- Quiet hours: on or off (touch the screen to wake it)
- Connection: online, reconnecting (offline), or starting up
- Layout: **Follow device** (default), or Landscape or Portrait overrides for testing on a desktop
- Budget: On track or Over
- Jump to: Today, Deliveries, Budget, Photos, Name and voice (skips the PIN), Mic states
- Reset demo: clears everything the demo saved and restores the starting state

## What you can tap

- Today: the four agent items plus Inbox open their cards (Calendar, Shopper, Budget, Inbox Digest, and the Concierge item opens the waiting approval).
- Mic: tap for listening, tap again for working, then an answer card. The question and answer are scripted (rain jackets).
- Approvals: Approve or Decline opens the PIN pad, then a result card. The dishwasher item is over $150 and says to approve on the phone. Decline still asks for the PIN.
- Budget: status only (On track or Over). PIN 1234 shows the amounts, and they hide again after 20 seconds.
- Settings (gear): PIN, then Name and voice. Type a name on the on-screen keyboard (14 character limit), pick one of 28 voices (Eve is the default), move the speed slider (0.7 to 1.5), and choose who can approve (REVIEW option, default Any adult can approve). Play sample only shows the playing state. There is no audio.
- The dots at the bottom jump between screens. Tap the Held label to resume the automatic rotation.

## What is saved

The concierge name, voice, speed and approvals choice are saved in this browser's localStorage under `hypx-family-wall-demo-v1`. Nothing else is stored or sent. Use Reset demo in the demo menu to clear it.

## Not in the demo

No audio, no real PIN check, no real data, no push of any kind. Times are fixed at 3:10 PM on Friday, November 27 so every example stays consistent.

## Files

`index.html`, `css/display.css` (approved display CSS plus the card library and demo additions), `js/display.js` (display plus demo logic), `js/data.js`, `js/settings.js` (settings.json embedded), `js/cards.js` and `js/cards-data.js` (card library), `fonts/`, `img/`, `apple-touch-icon.png`.
