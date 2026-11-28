/* settings.json, embedded so the demo makes no requests. DRAFT - example data. */
window.HYPX_SETTINGS={
 "_note": "DRAFT - example data. Sample per-home settings for the family display. Fictional family.",
 "family": {
  "name": "Example family",
  "timezone": "America/Los_Angeles"
 },
 "members": [
  {
   "id": "alex",
   "name": "Alex",
   "initial": "A",
   "role": "parent",
   "color": "m1"
  },
  {
   "id": "sam",
   "name": "Sam",
   "initial": "S",
   "role": "parent",
   "color": "m2"
  },
  {
   "id": "riley",
   "name": "Riley",
   "initial": "R",
   "role": "child",
   "color": "m3"
  },
  {
   "id": "jo",
   "name": "Jo",
   "initial": "J",
   "role": "child",
   "color": "m4"
  }
 ],
 "device": {
  "model": "iPad 11-inch (A16)",
  "resolution": "2360x1640",
  "lock": "Single App Mode via device management",
  "onBoot": "opens the display page straight away"
 },
 "theme": "light",
 "themeOptions": [
  "light",
  "dark",
  "auto"
 ],
 "autoTheme": {
  "darkFrom": "19:30",
  "lightFrom": "06:30"
 },
 "rotationSeconds": 20,
 "holdOnTap": true,
 "screens": {
  "today": true,
  "deliveries": true,
  "budget": true,
  "slideshow": true
 },
 "screenOrder": [
  "today",
  "deliveries",
  "budget",
  "slideshow"
 ],
 "budget": {
  "hideAmounts": true,
  "revealSeconds": 20,
  "voiceReadoutRequiresPin": true
 },
 "slideshow": {
  "secondsPerPhoto": 10,
  "photos": [
   "img/placeholder-dusk.jpg",
   "img/placeholder-morning.jpg",
   "img/placeholder-golden.jpg"
  ],
  "overlay": {
   "time": true,
   "nextEvent": true
  }
 },
 "mic": {
  "mode": "tap",
  "corner": "bottom-right"
 },
 "weather": {
  "enabled": true,
  "units": "F",
  "location": "Example city"
 },
 "offline": {
  "showAfterSeconds": 10,
  "message": "Reconnecting",
  "bootMessage": "Starting up",
  "statusChip": "{concierge.name} is reconnecting",
  "micUsableOffline": true,
  "queueRequests": true,
  "queueNote": "Saved - {concierge.name} will send this when we reconnect",
  "approvalsOffline": "disabled",
  "approvalsOfflineNote": "Approvals will be back when we reconnect",
  "neverApproveOffline": true
 },
 "agents": {
  "showStatusStrip": true,
  "list": [
   "concierge",
   "calendar",
   "shopper",
   "budget"
  ]
 },
 "approvals": {
  "showOnDisplay": true,
  "wallApprove": true,
  "pinRequired": true,
  "declineNeedsPin": true,
  "pinCheckedOn": "server",
  "overLimitNote": "Over ${limit} - approve on your phone",
  "maxShown": 3,
  "note": "Items at or under approval_wall_limit can be approved or declined on the wall with the adult's own PIN. Over the limit: no Approve button on the wall, phone only. Decline still works with a PIN."
 },
 "approval_wall_limit": 150,
 "concierge": {
  "name": "Concierge",
  "nameMaxLength": 14,
  "nameDefault": "Concierge",
  "changeRequires": "adult_pin_or_app",
  "voice": "eve",
  "voiceSpeed": 1.0,
  "voiceFallback": "device",
  "familyTalksTo": "concierge only",
  "showHandoffLine": true,
  "handoffText": "{concierge.name} is checking with {specialist}...",
  "handoffDoneText": "{concierge.name} checked with {specialist}",
  "_note": "DRAFT mock. Source of truth for these fields is Website Manager's /workspace/website-manager/personal-bots/settings-schema-DRAFT.json and concierge-voices-DRAFT.md. concierge.voice is a Grok Bot voice name (28 documented TTS voices; Claudia is omitted). concierge.voiceSpeed is capped at 0.7 to 1.5 on the wall (default 1). The iPad built-in voice is the offline fallback only."
 }
};
