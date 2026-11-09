# iPhone Safari and VoiceOver acceptance

Updated November 9, 2026.

**Status: pending physical-device results. Feature work is gated until this pass
is completed and any blocking findings are resolved.** Browser emulation,
accessibility-tree inspection, and automated tests do not complete this gate.

The user selected iPhone Safari with VoiceOver. This session has no connected
phone or remote control of that iPhone; hands-on observations must come from
the device operator. Do not record a pass from the planned steps below.

## Test record

| Field | Value |
| --- | --- |
| Live site | https://geo-master-livid.vercel.app/ |
| Tested release / date | Pending |
| iPhone model / iOS version | Pending |
| Operator | Pending |
| Safari, real software keyboard | Pending |
| VoiceOver enabled, actual spoken output | Pending |

## Required cases

Use a fresh Safari tab. Keep any existing saved progress; use a new quiz rather
than clearing the operator's browser storage. Test with VoiceOver off first,
then enable VoiceOver for the second half. Record exact announcements or
unexpected behavior for failures. Mark an unperformed case **Not tested**.

| ID | Hands-on steps and acceptance criteria | Result |
| --- | --- | --- |
| P1 | Home retains its spinning globe. Open setup, select a region, exercise all four mode choices and Timed/Untimed. Every choice and Start remains reachable in portrait and landscape, without horizontal page overflow. | Not tested |
| P2 | Start Name countries. Type a correct country with the real iOS keyboard; automatic acceptance and clearing still work. Open Identify and Capital quizzes: Check answer remains reachable above the keyboard, errors are understandable, and the input does not unexpectedly zoom the page. | Not tested |
| P3 | In Find on the map, zoom/pan, answer correctly, and advance after three wrong picks. The next question does not move the camera toward its answer. Recenter restores the region. Explore a small country or the Caribbean detail and confirm zoom, taps, and dismissal work on touch. | Not tested |
| P4 | Pause/resume; rotate with the keyboard open and closed; background Safari and return; reload and resume saved progress. Score, clock, controls, and answer input recover without overlap or a stuck loading screen. | Not tested |
| V1 | With VoiceOver on, navigate Home and setup by swiping. Buttons and mode choices have meaningful names; the selected mode and time option are announced; focus order matches the task. Start a text quiz, submit an incorrect and a correct answer, and record whether feedback/score updates are spoken. | Not tested |
| V2 | Open Pause. Swipe forward/backward through its actions: focus stays inside the dialog and cannot reach the underlying map/HUD. Resume closes it and returns to the quiz control. Confirm Finish & review is distinguishable from Discard quiz. | Not tested |
| V3 | Explore Peru, read its country name, capital, facts and expandable story with VoiceOver, then close the profile. Finish a quiz: score, review, Retry, and map/results controls are reachable. Open native Share if available and cancel; focus returns sensibly. | Not tested |
| V4 | Check whether Find on the map exposes individual selectable country targets to VoiceOver, and whether Identify's visual highlight has an understandable nonvisual route. A canvas announced only as "Map" is not evidence these modes are usable nonvisually. Record any unsupported journey explicitly as a blocking finding or an agreed limitation; do not silently pass it. | Not tested |
| P5 | Repeat key setup, answer, Pause, and results actions at 200% Safari Page Zoom/larger text and with Reduce Motion enabled. Essential controls remain reachable; any failure is recorded with the setting and orientation. | Not tested |

## Completion rule

Record device/version, tested release, date, and a result for every case. Resolve
blocking findings and repeat the affected cases on the same physical device.
Any accepted limitation requires an explicit product decision. Keep the gate
open while cases are Not tested, blocked, or awaiting that decision. No new
feature starts while this gate is open.

Automated regression results belong in the associated maintenance PRs and test
receipts; they supplement this record and do not substitute for it.
