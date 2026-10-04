# Motion

One system for every movement on the site. Code: `src/scripts/motion.ts` (GreenSock Animation Platform, "GSAP", free for commercial use since version 3.13, April 2025).

## Rules

1. Motion explains, it never decorates. Things arrive, prices count, the steps line fills as you read.
2. One set of timings and curves. No component invents its own.
3. People who ask their device for reduced motion get the content at once, with no movement. The water, fish and opening animation are skipped entirely.
4. Nothing important waits on motion. If the script fails, a safety timer shows everything within four seconds.

## Timings (seconds)

| Name | Value | Used for |
|---|---|---|
| quick | 0.3 | labels, small changes |
| base | 0.7 | list items |
| slow | 1.0 | headings, blocks |
| epic | 1.4 | photo reveals |

Gap between items in a group: 0.07 s. Things start when their top passes 85 percent of the screen height.

## Curves

| Name | Curve | Feel |
|---|---|---|
| out | expo.out | arriving — fast, then settles |
| soft | power3.out | gentle arrival |
| inOut | power2.inOut | travelling from one place to another |
| water | sine.inOut | idle loops that should feel like water |

## Patterns (`data-motion="..."`)

| Pattern | What it does |
|---|---|
| `lines` | heading lines rise from behind a mask |
| `fade` | block fades and rises (`data-delay` in seconds) |
| `list` | children arrive one after another |
| `wipe` | photo uncovered bottom-up while settling from a slight zoom |
| `count` | a price counts up to its value, then re-reads the live feed |
| `draw` | SVG lines marked `data-draw` draw themselves |
| `parallax` | image moves a little slower than the page |
| `progress` | a bar fills as the reader moves through `data-step` items; the current step gets `is-active` |
| `cue` | adds `.in` on arrival and hands the moment to CSS |

## Home page hero

- **Caustics**: our own WebGL (web graphics library) shader drawing the moving net of light that sun throws on a pond floor. Half resolution, about 30 frames a second, pauses off screen.
- **Fish school**: a canvas flock of fingerlings using the "boids" rules (keep apart, match heading, stay together); scatters from the pointer or a finger.
- **Light shafts**: CSS, swaying slowly.
- **Live price board**: split-flap style; rows read from the live price feed, never hard-coded.
- **Depth gauge**: wide screens only; reads 0 to 1.5 metres as you scroll.
- **Opening animation**: first visit per session only — the mark draws, drops a single droplet, and its ripples open the page. About 2.2 seconds.
