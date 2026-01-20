I don't have write permissions to create the file. Let me provide the complete analysis and the JSON content in my response for you to review.

---

# Project Analysis: Harmony (Arpesia)

## Overview

Harmony (Arpesia) is a Next.js-based web application for interactive sheet music reading and playback. It combines OpenSheetMusicDisplay (OSMD) for MusicXML rendering with a Tone.js-based audio engine supporting 121+ high-quality SFZ instruments. The app targets musicians of all levels, offering tempo control, note translation, virtual piano, and a personal music library.

## Tech Stack

- **Framework**: Next.js 16.0.4 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, shadcn/ui components (new-york variant)
- **Audio**: Tone.js 15.1.22 for sample-accurate playback scheduling
- **Music Notation**: OpenSheetMusicDisplay (OSMD) 1.9.3
- **Testing**: Vitest 4.0.16 with Testing Library
- **Code Quality**: ESLint 9, Prettier, Husky pre-commit hooks

## Current Capabilities

- **Sheet Music Viewer**: Load and render MusicXML files with zoom, pagination
- **Audio Playback**: Play/pause/resume with sample-accurate Tone.js scheduling
- **121 Instruments**: Organized by category (pianos, strings, winds, percussion, etc.)
- **Virtual Piano**: Interactive 3-octave keyboard with QWERTY mapping
- **Playback Controls**: Volume, speed (0.5x-2.0x), loop, mute, pitch offset
- **User Pages**: Landing, login/register (UI only), library (mock data), settings (mock)
- **Help Center**: FAQ, searchable help categories

## Identified Opportunities

| Feature                  | Why                                                             | Impact | Effort |
| ------------------------ | --------------------------------------------------------------- | ------ | ------ |
| **Demo Experience**      | New users have no sample to try - friction for first experience | High   | Low    |
| **Click-to-Seek**        | Progress bar isn't clickable - basic media player UX            | High   | Low    |
| **Keyboard Shortcuts**   | Musicians need hands-free playback control                      | High   | Low    |
| **A/B Loop Markers**     | Practice difficult sections repeatedly                          | High   | Medium |
| **File Upload**          | Library import button is non-functional                         | High   | Medium |
| **Note Highlighting**    | Visual feedback for which notes are playing                     | High   | Medium |
| **Skip Forward/Back**    | SkipBack/Forward buttons are TODO                               | Medium | Low    |
| **Tempo Tap**            | Intuitive tempo setting by tapping                              | Medium | Low    |
| **Instrument Favorites** | Quick access to preferred instruments (121 is many)             | Medium | Low    |
| **User Preferences**     | Settings don't persist across sessions                          | Medium | Low    |
| **Recent Files**         | No quick access to recently opened partitions                   | Medium | Low    |
| **Global Transpose**     | Musicians need to transpose for their instrument                | Medium | Low    |
| **Share Feature**        | Share button exists but doesn't work                            | Medium | Low    |
| **Metronome**            | Visual/audio beat indicator for practice                        | Medium | Medium |
| **Speed Presets**        | Quick buttons for common speeds                                 | Low    | Low    |
| **Native Fullscreen**    | Fullscreen doesn't use browser API                              | Low    | Low    |
| **Settings Page**        | Settings page is just mockup                                    | Low    | Medium |

---

# Proposed User Stories (`ralph/prd.json`)

```json
{
  "feature": "Harmony UX & Feature Enhancements",
  "version": "1.0.0",
  "created": "2026-01-17",
  "stories": [
    {
      "id": 1,
      "feature": "Demo Experience",
      "title": "Add demo partition link on landing page",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In components/landing-hero.tsx, add a third button 'Essayer une démo' that links to /reader/demo. Create a new route app/reader/demo/page.tsx that redirects to /reader/fur-elise-beethoven (the existing sample MusicXML). Use the existing Button component with variant='ghost'. The demo button should appear between the two existing buttons.",
      "acceptance_criteria": [
        "Landing page shows 'Essayer une démo' button",
        "Button links to /reader/demo",
        "Demo page redirects to sample partition",
        "No authentication required for demo"
      ],
      "files_to_modify": ["components/landing-hero.tsx"],
      "files_to_create": ["app/reader/demo/page.tsx"],
      "depends_on": [],
      "notes": "Quick win for new user onboarding"
    },
    {
      "id": 2,
      "feature": "Playback Controls",
      "title": "Implement click-to-seek on progress bar",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In app/reader/[partitionId]/page.tsx, make the progress bar (div with class 'w-full bg-slate-200 rounded-full h-2' around line 1072) clickable. When clicked, calculate the click position as a percentage, convert to time using playbackState.duration, and call a new seekTo function. Add seekTo to use-tone-player.ts that stops current playback and restarts from the specified time using the existing playScore function with startFromTime parameter.",
      "acceptance_criteria": [
        "Clicking progress bar jumps to that position",
        "Visual progress bar updates immediately",
        "Playback continues from new position if was playing",
        "Seeking works when paused (updates position but doesn't auto-play)"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx", "hooks/use-tone-player.ts"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Basic UX expectation for any media player"
    },
    {
      "id": 3,
      "feature": "Playback Controls",
      "title": "Add keyboard shortcuts for playback",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In app/reader/[partitionId]/page.tsx, add a useEffect that listens for keyboard events: Space = toggle play/pause, Escape = stop/reset, ArrowLeft = skip backward 5s, ArrowRight = skip forward 5s, M = toggle mute, L = toggle loop. Ensure events don't fire when user is typing in an input field (check document.activeElement). Display keyboard shortcuts in a tooltip or help icon near the playback controls.",
      "acceptance_criteria": [
        "Space toggles play/pause",
        "Escape stops playback and resets position",
        "Arrow keys skip 5 seconds forward/backward",
        "M toggles mute",
        "L toggles loop",
        "Shortcuts don't interfere with text input",
        "Small help indicator shows available shortcuts"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Musicians need hands-free control while playing their instrument"
    },
    {
      "id": 4,
      "feature": "Playback Controls",
      "title": "Add speed preset buttons",
      "done": false,
      "approved": false,
      "priority": "low",
      "prompt": "In app/reader/[partitionId]/page.tsx, below the playback speed slider (around line 930), add a row of small preset buttons: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x. When clicked, set playbackSpeed to that value. Style as small pill buttons using existing Tailwind classes. Highlight the currently selected speed.",
      "acceptance_criteria": [
        "6 speed preset buttons appear below slider",
        "Clicking a preset updates the slider and playback speed",
        "Current speed is visually highlighted",
        "Slider and preset buttons stay in sync"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Quick access to common practice speeds"
    },
    {
      "id": 5,
      "feature": "Playback Controls",
      "title": "Implement skip forward/backward functions",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, implement the skipBackward and skipForward functions (currently marked TODO around lines 638-646). They should seek to currentTime - 5 seconds and currentTime + 5 seconds respectively, clamping to valid range [0, duration]. Use the seekTo function from story #2. Update the button click handlers to use these functions.",
      "acceptance_criteria": [
        "SkipBack button jumps back 5 seconds",
        "SkipForward button jumps forward 5 seconds",
        "Cannot seek before 0 or after duration",
        "Buttons work during playback and when paused"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [2],
      "notes": "Depends on seekTo implementation"
    },
    {
      "id": 6,
      "feature": "Tempo",
      "title": "Add tempo tap button",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, add a 'Tap Tempo' button near the speed controls. Track the last 4 tap times in a ref array. On each tap, calculate average interval and convert to BPM. Map BPM to playbackSpeed (e.g., if original tempo is 90 BPM, tapping at 45 BPM = 0.5x speed). Display the calculated BPM briefly. Reset tap history if more than 2 seconds pass between taps.",
      "acceptance_criteria": [
        "Tap Tempo button appears near speed controls",
        "Tapping 4+ times calculates average tempo",
        "Speed adjusts based on tapped tempo vs original",
        "Shows calculated BPM for 2 seconds",
        "Resets if user stops tapping for 2+ seconds"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Intuitive way for musicians to set practice tempo"
    },
    {
      "id": 7,
      "feature": "Instrument Selection",
      "title": "Add instrument favorites with localStorage",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, add a star icon button next to each instrument in the dropdown. Clicking toggles favorite status stored in localStorage (key: 'harmony_favorite_instruments', value: array of sfzName strings). Add a 'Favorites' pseudo-category at the top of INSTRUMENT_CATEGORIES that shows only favorited instruments. If no favorites, show 'Aucun favori' message.",
      "acceptance_criteria": [
        "Star icon appears next to each instrument option",
        "Clicking star toggles favorite status",
        "Favorites persist across page reloads (localStorage)",
        "New 'Favoris' category appears at top when favorites exist",
        "Favorites category shows favorited instruments"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "With 121 instruments, users need quick access to their preferred ones"
    },
    {
      "id": 8,
      "feature": "User Settings",
      "title": "Persist user preferences to localStorage",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "Create a new hook hooks/use-preferences.ts that manages user preferences in localStorage. Save: defaultInstrument, defaultVolume, defaultSpeed, lastUsedZoom. In app/reader/[partitionId]/page.tsx, use this hook to load initial values and save changes. Use debouncing (300ms) when saving to avoid excessive writes.",
      "acceptance_criteria": [
        "New usePreferences hook created",
        "Preferences saved to localStorage on change",
        "Reader page loads saved preferences on mount",
        "Debounced saving (300ms delay)",
        "Graceful fallback if localStorage unavailable"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": ["hooks/use-preferences.ts"],
      "depends_on": [],
      "notes": "Users expect their settings to persist"
    },
    {
      "id": 9,
      "feature": "Practice Mode",
      "title": "Add A/B loop marker buttons",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In app/reader/[partitionId]/page.tsx, add two buttons next to the loop toggle: 'A' (set start point) and 'B' (set end point). Store loopStart and loopEnd times in state. When both are set and loop is enabled, playback should restart from A when reaching B. Show visual markers on the progress bar. Add a 'Clear' button to reset markers. Display times as MM:SS.",
      "acceptance_criteria": [
        "A and B buttons appear near loop control",
        "Clicking A sets loop start to current time",
        "Clicking B sets loop end to current time",
        "Visual markers show on progress bar",
        "When loop enabled with A/B set, loops between markers",
        "Clear button resets both markers",
        "Times displayed in MM:SS format"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [2],
      "notes": "Essential practice feature - repeat difficult sections"
    },
    {
      "id": 10,
      "feature": "Global Transpose",
      "title": "Add global transpose control",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, add a transpose control (dropdown or +/- buttons) that shifts all played notes by N semitones (-12 to +12). This is different from partitionNoteOffset (which already exists for alignment) - transpose should be a musical feature. Update the playNote and playScore calls to add this offset to MIDI values. Display current transpose value (e.g., '+2' or 'C -> D').",
      "acceptance_criteria": [
        "Transpose control appears in audio controls section",
        "Range: -12 to +12 semitones (one octave each direction)",
        "All played notes shift by transpose amount",
        "Display shows semitone offset and key change",
        "Works with both score playback and virtual piano"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Different from existing partitionNoteOffset - this is for transposing instruments"
    },
    {
      "id": 11,
      "feature": "Navigation",
      "title": "Implement native fullscreen API",
      "done": false,
      "approved": false,
      "priority": "low",
      "prompt": "In app/reader/[partitionId]/page.tsx, update toggleFullscreen (around line 711) to use the browser's native Fullscreen API (document.documentElement.requestFullscreen / document.exitFullscreen). Add a useEffect to sync isFullscreen state with fullscreenchange events. Keep the existing CSS-based fullscreen as a fallback for unsupported browsers.",
      "acceptance_criteria": [
        "Fullscreen button triggers native browser fullscreen",
        "Pressing Escape or F11 exits fullscreen properly",
        "State stays synced with browser fullscreen status",
        "Falls back to CSS-based fullscreen if API unavailable"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Better fullscreen experience with native API"
    },
    {
      "id": 12,
      "feature": "Library",
      "title": "Implement recent files list with localStorage",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "Create hooks/use-recent-files.ts to track recently opened files in localStorage (max 10 items). Each entry: {id, title, lastOpened, fileUrl}. In app/reader/[partitionId]/page.tsx, add to recent list when partition loads. In app/[userId]/library/page.tsx, add a 'Récents' section above the grid that shows recently opened files. Link each recent item to its reader page.",
      "acceptance_criteria": [
        "useRecentFiles hook created",
        "Opening a partition adds it to recent list",
        "Library page shows 'Récents' section",
        "Maximum 10 recent files stored",
        "Clicking recent item opens partition",
        "Recent files persist across sessions"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx", "app/[userId]/library/page.tsx"],
      "files_to_create": ["hooks/use-recent-files.ts"],
      "depends_on": [],
      "notes": "Quick access to frequently used partitions"
    },
    {
      "id": 13,
      "feature": "Library",
      "title": "Add file upload functionality to library",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In app/[userId]/library/page.tsx, make the 'Importer une partition' button functional. Add a hidden file input that accepts .mxl, .musicxml, .xml files. On file select, store in IndexedDB using a new lib/file-storage.ts utility. Generate a unique ID and redirect to /reader/[id]. The reader should check IndexedDB first before falling back to public/ folder.",
      "acceptance_criteria": [
        "Import button opens file picker dialog",
        "Accepts .mxl, .musicxml, .xml files",
        "Files stored in IndexedDB",
        "Unique ID generated for each upload",
        "Redirects to reader after upload",
        "Reader loads files from IndexedDB"
      ],
      "files_to_modify": ["app/[userId]/library/page.tsx", "app/reader/[partitionId]/page.tsx"],
      "files_to_create": ["lib/file-storage.ts"],
      "depends_on": [],
      "notes": "Critical feature - without upload, library is just mock data"
    },
    {
      "id": 14,
      "feature": "Visual Feedback",
      "title": "Add note highlighting during playback",
      "done": false,
      "approved": false,
      "priority": "high",
      "prompt": "In components/sheet-music-viewer.tsx, enhance the playback cursor to highlight currently playing notes. Access OSMD's GraphicNotes via the cursor system. When a note's startTime <= playbackTime < startTime + duration, add a CSS class or SVG highlight. Use a semi-transparent colored rectangle behind the note head. Sync with the existing cursor position logic.",
      "acceptance_criteria": [
        "Notes light up when they are being played",
        "Highlight appears as colored background behind note",
        "Multiple simultaneous notes can be highlighted",
        "Highlighting syncs with audio playback",
        "Performance: no lag with complex scores"
      ],
      "files_to_modify": ["components/sheet-music-viewer.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Major learning aid - see which notes are playing"
    },
    {
      "id": 15,
      "feature": "Export",
      "title": "Implement share functionality",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, make the Share button functional. Use the Web Share API (navigator.share) if available, falling back to copying URL to clipboard. Share data: title from partition, URL with partition ID. Show a toast notification on successful share/copy. Use the existing UI pattern for notifications if one exists, or add a simple toast div.",
      "acceptance_criteria": [
        "Share button opens native share dialog (if supported)",
        "Falls back to copy URL to clipboard",
        "Shows success notification",
        "Shared URL links directly to the partition"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Social sharing drives user acquisition"
    },
    {
      "id": 16,
      "feature": "Metronome",
      "title": "Add visual metronome during playback",
      "done": false,
      "approved": false,
      "priority": "medium",
      "prompt": "In app/reader/[partitionId]/page.tsx, add a metronome toggle button and visual indicator. When enabled, show a pulsing dot or bar that flashes on each beat based on the score's tempo and time signature. Calculate beat positions from playbackData.tempo and playbackTime. Add subtle beat sound option using Tone.js (optional, can be toggled separately).",
      "acceptance_criteria": [
        "Metronome toggle button in controls",
        "Visual pulse/flash on each beat",
        "Beat timing matches score tempo",
        "Optional click sound checkbox",
        "Works in sync with playback"
      ],
      "files_to_modify": ["app/reader/[partitionId]/page.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": "Practice tool for keeping time"
    },
    {
      "id": 17,
      "feature": "Settings",
      "title": "Implement preferences page functionality",
      "done": false,
      "approved": false,
      "priority": "low",
      "prompt": "In app/[userId]/settings/page.tsx, make the settings cards functional. 'Préférences' should allow setting: default tempo (slider 60-200), default instrument (dropdown), theme preference (light/dark/system). Store in localStorage using the usePreferences hook from story #8. Add actual form controls instead of just CTA buttons.",
      "acceptance_criteria": [
        "Préférences card has working controls",
        "Default tempo slider with BPM display",
        "Default instrument dropdown (categories + instruments)",
        "Theme selector (future: implement theme)",
        "Settings persist to localStorage",
        "Changes reflected in reader page"
      ],
      "files_to_modify": ["app/[userId]/settings/page.tsx"],
      "files_to_create": [],
      "depends_on": [8],
      "notes": "Settings page is currently just static mockup"
    }
  ],
  "metadata": {
    "total_stories": 17,
    "approved": 0,
    "completed": 0,
    "pending": 17
  }
}
```

---

## Summary of Prioritized Stories

### High Priority (Quick Wins + Critical Features)

1. **Demo Experience** - Add demo link to landing (Low effort)
2. **Click-to-Seek** - Make progress bar clickable (Low effort)
3. **Keyboard Shortcuts** - Space, arrows, M, L (Low effort)
4. **A/B Loop Markers** - Section practice (Medium effort)
5. **File Upload** - Make library functional (Medium effort)
6. **Note Highlighting** - Visual feedback during playback (Medium effort)

### Medium Priority (UX Enhancements)

7. **Skip Forward/Back** - Implement TODO buttons
8. **Tempo Tap** - Intuitive tempo setting
9. **Instrument Favorites** - Quick access to 121 instruments
10. **User Preferences** - Persist settings
11. **Recent Files** - Quick access list
12. **Global Transpose** - Musical transposition
13. **Share Feature** - Make share button work
14. **Metronome** - Visual/audio beat indicator

### Low Priority (Polish)

15. **Speed Presets** - Quick speed buttons
16. **Native Fullscreen** - Browser fullscreen API
17. **Settings Page** - Functional preferences

---

Please grant write access to save the `prd.json` file, or copy the JSON above into `ralph/prd.json`. Then set `approved: true` on the stories you want Ralph to implement.
