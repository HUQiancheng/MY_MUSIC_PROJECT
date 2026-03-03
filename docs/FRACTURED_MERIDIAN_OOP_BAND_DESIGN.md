# Fractured Meridian: OOP Band Design Blueprint

## 0. Purpose
This document defines a full art+engineering design for the Fractured Meridian track engine.
The goal is to produce narrative IDM that feels like a coordinated band, not layered independent generators.
The system must prioritize intent clarity, role discipline, and controlled complexity.

Design principles:
1. Every event must have role intent (call, response, support, transition, release).
2. No module may occupy full attention continuously; all roles must breathe.
3. Kick is not the life support machine; groove must survive kick thinning.
4. Pattern switches require audible preconditions in prior bars.
5. Conversation hierarchy must change across sections to preserve narrative contrast.
6. Variation is mandatory, randomness is optional.
7. Looping should create identity, not stagnation.
8. Arrangement density must be bounded by section budgets.
9. Timbral diversity must map to frequency role diversity.
10. The listener should perceive paragraphs, not a single ongoing sentence.

## 1. Song Form Timeline (Primary Narrative)
BPM target default: 174 (jungle/drum-n-bass friendly while leaving phrase space).
Duration target: 180 seconds.

| section | seconds | narrative intent |
| --- | --- | --- |
| intro | 0-24 | world-building, sparse pulse, motif seed only |
| verse | 24-60 | groove establishment, rhythmic questions and harmonic setup |
| hook | 60-84 | memorable motif statement with guitar and keys lock |
| chorus | 84-120 | energy apex with controlled density and layered call-response |
| bridge | 120-156 | contrast, reduced kick occupancy, harmonic detour and rebuild |
| outro | 156-180 | release, motif recall, reduction of low-end pressure |

Section transitions are treated as compositional events, not parameter jumps.
Each transition must include a handoff protocol with at least three role contributions.

## 2. Drum Motif Architecture (Jungle/DnB Core)
Four motifs are canonical and reused with controlled transformation:
- motif 1: amen-a -> classic rolling break posture with clear backbeat anchors
- motif 2: amen-b -> offset syncopation and short pocket flips for verse lift
- motif 3: think-break -> mid-phrase snap and compressed ghost matrix for hooks
- motif 4: tramen-lite -> edgy fragmented drive for chorus and bridge handoffs

Transformation operations per bar:
1. rotation by bar signature
2. mutate-index attenuation
3. dropout threshold masking
4. section-specific density remap
5. handoff-bar pre-switch thinning
6. deep-kick budget limiting
7. timbre variant routing (soft/tight/crunch/deep)
8. anti-repeat correction if signature equals previous bar

## 3. OOP Class Structure
The engine follows an agent + conductor architecture.

- class Agent
  role: abstract role root
  responsibilities: shared timing helpers, emission API, and behavioral contracts
- class DrummerAgent
  role: rhythm specialist
  responsibilities: jungle motif selection, kick timbre rotation, ghost control, fill handoff
- class BassAgent
  role: low-end specialist
  responsibilities: counterpoint against drums and harmonic glide to next section
- class HarmonyAgent
  role: keys/pad specialist
  responsibilities: chord atmosphere, phrase-level keys, harmonic calls
- class GuitarAgent
  role: riff specialist
  responsibilities: comping, hook statements, rhythmic mutes, motif reinforcement
- class LeadAgent
  role: foreground specialist
  responsibilities: melodic response routing, contour shaping, chorus reinforcement
- class TextureAgent
  role: atmosphere specialist
  responsibilities: transition FX, drone narrative, metallic and glitch punctuation
- class ConductorScheduler
  role: global coordinator
  responsibilities: section form, conversation mode, event ordering, bar context

Interaction contract:
- each Agent receives a bar context object from ConductorScheduler
- each Agent may emit events to timbre buses through a shared emit API
- each Agent may append call events for subsequent agents
- no Agent can directly mutate another Agent internal state
- the Conductor controls ordering and section conversation mode

## 4. Conductor Conversation Modes
| section | mode | behavior |
| --- | --- | --- |
| intro | harmony_call | keys/pad initiate, drums lightly answer |
| verse | drum_call + harmony_call alternation | drums ask, keys or guitar answer by phrase half |
| hook | guitar_call | riff-first phrase with melodic acknowledgment |
| chorus | mixed_call | rapid role exchange with bounded event limits |
| bridge | bass_call | bass leads phrase direction while drums thin |
| outro | release_call | responses simplify and decay |

## 5. Role Frequency Responsibilities
| role family | band focus | guardrail |
| --- | --- | --- |
| kick | 30-220Hz | transient and anchor pulses only, not continuous sub occupation |
| bass | 35-420Hz | melodic counterline and glide logic |
| snare | 160Hz-9kHz | backbeat punctuation and phrase articulation |
| hats/ride | 2.5-14kHz | time-grid detail and swing texture |
| keys/pads | 180Hz-9kHz | harmony body and narrative color |
| guitar | 180Hz-7kHz | riff identity and comping glue |
| lead/counter | 350Hz-12kHz | foreground responses and motif spotlight |
| texture/fx | 70Hz-14kHz | transitions and atmospheric continuity |

## 6. Kick Narrative Constraints
Kick constraints are explicit to prevent boring boom-boom saturation.
1. intro deep budget: 1-2 hits per bar max
2. verse deep budget: 2-3 hits per bar max
3. hook deep budget: 2-3 hits per bar max
4. chorus deep budget: 3-4 hits per bar max depending phrase bar
5. bridge deep budget: 2 hits per bar max
6. outro deep budget: 1 hit per bar max
7. all non-budget kicks routed to tight/soft/crunch variants
8. pre-switch bars must begin with kick attenuation before transition rise
9. kick pattern equality with previous bar triggers forced mutation
10. kick is never allowed to be the only persistent excitement source

## 7. Pattern Shift Reasoning Protocol
Each pattern shift must have a reason chain:
1. signal: rhythmic clue appears in prior half bar
2. confirmation: harmonic or guitar answer validates shift intent
3. handoff: texture agent introduces riser/tom/metal cue
4. arrival: new motif starts with restrained first beat to prevent brute-force shock
5. stabilization: second half bar defines new groove center
6. memory: outgoing motif leaves one identifiable echo note

## 8. Engineering Design Patterns
1. Template Method: Agent base class defines shared API while subclasses fill role-specific behavior
2. Strategy: conversation mode and motif selection change by section and phrase context
3. Mediator: ConductorScheduler mediates interactions and prevents direct agent coupling
4. State: section and phrase context drive behavior state transitions
5. Factory (lightweight): scheduler constructs agent set and shared dependencies once per render

## 9. Implementation Checklist
- task-001: implemented
- task-002: implemented
- task-003: implemented
- task-004: implemented
- task-005: implemented
- task-006: implemented
- task-007: implemented
- task-008: implemented
- task-009: implemented
- task-010: implemented
- task-011: implemented
- task-012: implemented
- task-013: implemented
- task-014: implemented
- task-015: implemented
- task-016: implemented
- task-017: implemented
- task-018: implemented
- task-019: implemented
- task-020: implemented
- task-021: implemented
- task-022: implemented
- task-023: implemented
- task-024: implemented
- task-025: implemented
- task-026: implemented
- task-027: implemented
- task-028: implemented
- task-029: implemented
- task-030: implemented
- task-031: implemented
- task-032: implemented
- task-033: implemented
- task-034: implemented
- task-035: implemented
- task-036: implemented
- task-037: implemented
- task-038: implemented
- task-039: implemented
- task-040: implemented
- task-041: implemented
- task-042: implemented
- task-043: implemented
- task-044: implemented
- task-045: implemented
- task-046: implemented
- task-047: implemented
- task-048: implemented
- task-049: implemented
- task-050: implemented
- task-051: implemented
- task-052: implemented
- task-053: implemented
- task-054: implemented
- task-055: implemented
- task-056: implemented
- task-057: implemented
- task-058: implemented
- task-059: implemented
- task-060: implemented
- task-061: implemented
- task-062: implemented
- task-063: implemented
- task-064: implemented
- task-065: implemented
- task-066: implemented
- task-067: implemented
- task-068: implemented
- task-069: implemented
- task-070: implemented
- task-071: implemented
- task-072: implemented
- task-073: implemented
- task-074: implemented
- task-075: implemented
- task-076: implemented
- task-077: implemented
- task-078: implemented
- task-079: implemented
- task-080: implemented
- task-081: implemented
- task-082: implemented
- task-083: implemented
- task-084: implemented
- task-085: implemented
- task-086: implemented
- task-087: implemented
- task-088: implemented
- task-089: implemented
- task-090: implemented
- task-091: implemented
- task-092: implemented
- task-093: implemented
- task-094: implemented
- task-095: implemented
- task-096: pending refinement
- task-097: pending refinement
- task-098: pending refinement
- task-099: pending refinement
- task-100: pending refinement
- task-101: pending refinement
- task-102: pending refinement
- task-103: pending refinement
- task-104: pending refinement
- task-105: pending refinement
- task-106: pending refinement
- task-107: pending refinement
- task-108: pending refinement
- task-109: pending refinement
- task-110: pending refinement
- task-111: pending refinement
- task-112: pending refinement
- task-113: pending refinement
- task-114: pending refinement
- task-115: pending refinement
- task-116: pending refinement
- task-117: pending refinement
- task-118: pending refinement
- task-119: pending refinement
- task-120: pending refinement
- task-121: pending refinement
- task-122: pending refinement
- task-123: pending refinement
- task-124: pending refinement
- task-125: pending refinement
- task-126: pending refinement
- task-127: pending refinement
- task-128: pending refinement
- task-129: pending refinement
- task-130: pending refinement
- task-131: pending refinement
- task-132: pending refinement
- task-133: pending refinement
- task-134: pending refinement
- task-135: pending refinement
- task-136: pending refinement
- task-137: pending refinement
- task-138: pending refinement
- task-139: pending refinement
- task-140: pending refinement

## 10. Bar-by-Bar Narrative Draft (Primary Timeline)
Notation:
- D = drummer focus, B = bass focus, H = harmony focus, G = guitar focus, L = lead focus, T = texture focus
- C = call source, R = response source

| bar | time | section | focus | call/response note | shift reason |
| --- | --- | --- | --- | --- | --- |
| 0 | 0.00s | intro | H,T | C:H -> R:D-light | motif-dev |
| 1 | 1.38s | intro | H,T | C:H -> R:D-light | motif-dev |
| 2 | 2.76s | intro | H,T | C:H -> R:D-light | motif-dev |
| 3 | 4.14s | intro | H,T | C:H -> R:D-light | micro-turn |
| 4 | 5.52s | intro | H,T | C:H -> R:D-light | motif-dev |
| 5 | 6.90s | intro | H,T | C:H -> R:D-light | motif-dev |
| 6 | 8.28s | intro | H,T | C:H -> R:D-light | motif-dev |
| 7 | 9.66s | intro | H,T | C:H -> R:D-light | micro-turn |
| 8 | 11.03s | intro | H,T | C:H -> R:D-light | motif-dev |
| 9 | 12.41s | intro | H,T | C:H -> R:D-light | motif-dev |
| 10 | 13.79s | intro | H,T | C:H -> R:D-light | motif-dev |
| 11 | 15.17s | intro | H,T | C:H -> R:D-light | micro-turn |
| 12 | 16.55s | intro | H,T | C:H -> R:D-light | motif-dev |
| 13 | 17.93s | intro | H,T | C:H -> R:D-light | motif-dev |
| 14 | 19.31s | intro | H,T | C:H -> R:D-light | motif-dev |
| 15 | 20.69s | intro | H,T | C:H -> R:D-light | micro-turn |
| 16 | 22.07s | intro | H,T | C:H -> R:D-light | motif-dev |
| 17 | 23.45s | intro | H,T | C:H -> R:D-light | handoff_to_verse |
| 18 | 24.83s | verse | H,G | C:H -> R:B/L | motif-dev |
| 19 | 26.21s | verse | H,G | C:H -> R:B/L | micro-turn |
| 20 | 27.59s | verse | D,B | C:D -> R:H/G | motif-dev |
| 21 | 28.97s | verse | D,B | C:D -> R:H/G | motif-dev |
| 22 | 30.34s | verse | H,G | C:H -> R:B/L | motif-dev |
| 23 | 31.72s | verse | H,G | C:H -> R:B/L | micro-turn |
| 24 | 33.10s | verse | D,B | C:D -> R:H/G | motif-dev |
| 25 | 34.48s | verse | D,B | C:D -> R:H/G | motif-dev |
| 26 | 35.86s | verse | H,G | C:H -> R:B/L | motif-dev |
| 27 | 37.24s | verse | H,G | C:H -> R:B/L | micro-turn |
| 28 | 38.62s | verse | D,B | C:D -> R:H/G | motif-dev |
| 29 | 40.00s | verse | D,B | C:D -> R:H/G | motif-dev |
| 30 | 41.38s | verse | H,G | C:H -> R:B/L | motif-dev |
| 31 | 42.76s | verse | H,G | C:H -> R:B/L | micro-turn |
| 32 | 44.14s | verse | D,B | C:D -> R:H/G | motif-dev |
| 33 | 45.52s | verse | D,B | C:D -> R:H/G | motif-dev |
| 34 | 46.90s | verse | H,G | C:H -> R:B/L | motif-dev |
| 35 | 48.28s | verse | H,G | C:H -> R:B/L | micro-turn |
| 36 | 49.66s | verse | D,B | C:D -> R:H/G | motif-dev |
| 37 | 51.03s | verse | D,B | C:D -> R:H/G | motif-dev |
| 38 | 52.41s | verse | H,G | C:H -> R:B/L | motif-dev |
| 39 | 53.79s | verse | H,G | C:H -> R:B/L | micro-turn |
| 40 | 55.17s | verse | D,B | C:D -> R:H/G | motif-dev |
| 41 | 56.55s | verse | D,B | C:D -> R:H/G | motif-dev |
| 42 | 57.93s | verse | H,G | C:H -> R:B/L | motif-dev |
| 43 | 59.31s | verse | H,G | C:H -> R:B/L | handoff_to_hook |
| 44 | 60.69s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 45 | 62.07s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 46 | 63.45s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 47 | 64.83s | hook | G,H,L | C:G -> R:L/H | micro-turn |
| 48 | 66.21s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 49 | 67.59s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 50 | 68.97s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 51 | 70.34s | hook | G,H,L | C:G -> R:L/H | micro-turn |
| 52 | 71.72s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 53 | 73.10s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 54 | 74.48s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 55 | 75.86s | hook | G,H,L | C:G -> R:L/H | micro-turn |
| 56 | 77.24s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 57 | 78.62s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 58 | 80.00s | hook | G,H,L | C:G -> R:L/H | motif-dev |
| 59 | 81.38s | hook | G,H,L | C:G -> R:L/H | micro-turn |
| 60 | 82.76s | hook | G,H,L | C:G -> R:L/H | handoff_to_chorus |
| 61 | 84.14s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 62 | 85.52s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 63 | 86.90s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 64 | 88.28s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 65 | 89.66s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 66 | 91.03s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 67 | 92.41s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 68 | 93.79s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 69 | 95.17s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 70 | 96.55s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 71 | 97.93s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 72 | 99.31s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 73 | 100.69s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 74 | 102.07s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 75 | 103.45s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 76 | 104.83s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 77 | 106.21s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 78 | 107.59s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 79 | 108.97s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 80 | 110.34s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 81 | 111.72s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 82 | 113.10s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 83 | 114.48s | chorus | D,B,G,L | C:mixed -> R:mixed | micro-turn |
| 84 | 115.86s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 85 | 117.24s | chorus | D,B,G,L | C:mixed -> R:mixed | motif-dev |
| 86 | 118.62s | chorus | D,B,G,L | C:mixed -> R:mixed | handoff_to_bridge |
| 87 | 120.00s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 88 | 121.38s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 89 | 122.76s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 90 | 124.14s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 91 | 125.52s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 92 | 126.90s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 93 | 128.28s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 94 | 129.66s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 95 | 131.03s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 96 | 132.41s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 97 | 133.79s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 98 | 135.17s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 99 | 136.55s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 100 | 137.93s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 101 | 139.31s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 102 | 140.69s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 103 | 142.07s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 104 | 143.45s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 105 | 144.83s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 106 | 146.21s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 107 | 147.59s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 108 | 148.97s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 109 | 150.34s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 110 | 151.72s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 111 | 153.10s | bridge | B,H,T | C:B -> R:H/T | micro-turn |
| 112 | 154.48s | bridge | B,H,T | C:B -> R:H/T | motif-dev |
| 113 | 155.86s | bridge | B,H,T | C:B -> R:H/T | handoff_to_outro |
| 114 | 157.24s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 115 | 158.62s | outro | H,T | C:H -> R:soft ensemble | micro-turn |
| 116 | 160.00s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 117 | 161.38s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 118 | 162.76s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 119 | 164.14s | outro | H,T | C:H -> R:soft ensemble | micro-turn |
| 120 | 165.52s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 121 | 166.90s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 122 | 168.28s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 123 | 169.66s | outro | H,T | C:H -> R:soft ensemble | micro-turn |
| 124 | 171.03s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 125 | 172.41s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 126 | 173.79s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 127 | 175.17s | outro | H,T | C:H -> R:soft ensemble | micro-turn |
| 128 | 176.55s | outro | H,T | C:H -> R:soft ensemble | motif-dev |
| 129 | 177.93s | outro | H,T | C:H -> R:soft ensemble | motif-dev |

## 11. Micro-Bar Event Notes (two-line annotations per bar)
- bar-000 call-line: section=intro, phraseBar=0, kickPolicy=thin
- bar-000 response-line: guitar=support, lead=answer
- bar-001 call-line: section=intro, phraseBar=1, kickPolicy=thin
- bar-001 response-line: guitar=support, lead=answer
- bar-002 call-line: section=intro, phraseBar=2, kickPolicy=thin
- bar-002 response-line: guitar=support, lead=answer
- bar-003 call-line: section=intro, phraseBar=3, kickPolicy=thin
- bar-003 response-line: guitar=support, lead=answer
- bar-004 call-line: section=intro, phraseBar=0, kickPolicy=thin
- bar-004 response-line: guitar=support, lead=answer
- bar-005 call-line: section=intro, phraseBar=1, kickPolicy=thin
- bar-005 response-line: guitar=support, lead=answer
- bar-006 call-line: section=intro, phraseBar=2, kickPolicy=thin
- bar-006 response-line: guitar=support, lead=answer
- bar-007 call-line: section=intro, phraseBar=3, kickPolicy=thin
- bar-007 response-line: guitar=support, lead=answer
- bar-008 call-line: section=intro, phraseBar=0, kickPolicy=thin
- bar-008 response-line: guitar=support, lead=answer
- bar-009 call-line: section=intro, phraseBar=1, kickPolicy=thin
- bar-009 response-line: guitar=support, lead=answer
- bar-010 call-line: section=intro, phraseBar=2, kickPolicy=thin
- bar-010 response-line: guitar=support, lead=answer
- bar-011 call-line: section=intro, phraseBar=3, kickPolicy=thin
- bar-011 response-line: guitar=support, lead=answer
- bar-012 call-line: section=intro, phraseBar=0, kickPolicy=thin
- bar-012 response-line: guitar=support, lead=answer
- bar-013 call-line: section=intro, phraseBar=1, kickPolicy=thin
- bar-013 response-line: guitar=support, lead=answer
- bar-014 call-line: section=intro, phraseBar=2, kickPolicy=thin
- bar-014 response-line: guitar=support, lead=answer
- bar-015 call-line: section=intro, phraseBar=3, kickPolicy=thin
- bar-015 response-line: guitar=support, lead=answer
- bar-016 call-line: section=intro, phraseBar=0, kickPolicy=thin
- bar-016 response-line: guitar=support, lead=answer
- bar-017 call-line: section=intro, phraseBar=1, kickPolicy=thin
- bar-017 response-line: guitar=support, lead=answer
- bar-018 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-018 response-line: guitar=support, lead=answer
- bar-019 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-019 response-line: guitar=support, lead=answer
- bar-020 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-020 response-line: guitar=support, lead=answer
- bar-021 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-021 response-line: guitar=support, lead=answer
- bar-022 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-022 response-line: guitar=support, lead=answer
- bar-023 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-023 response-line: guitar=support, lead=answer
- bar-024 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-024 response-line: guitar=support, lead=answer
- bar-025 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-025 response-line: guitar=support, lead=answer
- bar-026 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-026 response-line: guitar=support, lead=answer
- bar-027 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-027 response-line: guitar=support, lead=answer
- bar-028 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-028 response-line: guitar=support, lead=answer
- bar-029 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-029 response-line: guitar=support, lead=answer
- bar-030 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-030 response-line: guitar=support, lead=answer
- bar-031 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-031 response-line: guitar=support, lead=answer
- bar-032 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-032 response-line: guitar=support, lead=answer
- bar-033 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-033 response-line: guitar=support, lead=answer
- bar-034 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-034 response-line: guitar=support, lead=answer
- bar-035 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-035 response-line: guitar=support, lead=answer
- bar-036 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-036 response-line: guitar=support, lead=answer
- bar-037 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-037 response-line: guitar=support, lead=answer
- bar-038 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-038 response-line: guitar=support, lead=answer
- bar-039 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-039 response-line: guitar=support, lead=answer
- bar-040 call-line: section=verse, phraseBar=0, kickPolicy=balanced
- bar-040 response-line: guitar=support, lead=answer
- bar-041 call-line: section=verse, phraseBar=1, kickPolicy=balanced
- bar-041 response-line: guitar=support, lead=answer
- bar-042 call-line: section=verse, phraseBar=2, kickPolicy=balanced
- bar-042 response-line: guitar=support, lead=answer
- bar-043 call-line: section=verse, phraseBar=3, kickPolicy=balanced
- bar-043 response-line: guitar=support, lead=answer
- bar-044 call-line: section=hook, phraseBar=0, kickPolicy=balanced
- bar-044 response-line: guitar=active, lead=answer
- bar-045 call-line: section=hook, phraseBar=1, kickPolicy=balanced
- bar-045 response-line: guitar=active, lead=answer
- bar-046 call-line: section=hook, phraseBar=2, kickPolicy=balanced
- bar-046 response-line: guitar=active, lead=answer
- bar-047 call-line: section=hook, phraseBar=3, kickPolicy=balanced
- bar-047 response-line: guitar=active, lead=answer
- bar-048 call-line: section=hook, phraseBar=0, kickPolicy=balanced
- bar-048 response-line: guitar=active, lead=answer
- bar-049 call-line: section=hook, phraseBar=1, kickPolicy=balanced
- bar-049 response-line: guitar=active, lead=answer
- bar-050 call-line: section=hook, phraseBar=2, kickPolicy=balanced
- bar-050 response-line: guitar=active, lead=answer
- bar-051 call-line: section=hook, phraseBar=3, kickPolicy=balanced
- bar-051 response-line: guitar=active, lead=answer
- bar-052 call-line: section=hook, phraseBar=0, kickPolicy=balanced
- bar-052 response-line: guitar=active, lead=answer
- bar-053 call-line: section=hook, phraseBar=1, kickPolicy=balanced
- bar-053 response-line: guitar=active, lead=answer
- bar-054 call-line: section=hook, phraseBar=2, kickPolicy=balanced
- bar-054 response-line: guitar=active, lead=answer
- bar-055 call-line: section=hook, phraseBar=3, kickPolicy=balanced
- bar-055 response-line: guitar=active, lead=answer
- bar-056 call-line: section=hook, phraseBar=0, kickPolicy=balanced
- bar-056 response-line: guitar=active, lead=answer
- bar-057 call-line: section=hook, phraseBar=1, kickPolicy=balanced
- bar-057 response-line: guitar=active, lead=answer
- bar-058 call-line: section=hook, phraseBar=2, kickPolicy=balanced
- bar-058 response-line: guitar=active, lead=answer
- bar-059 call-line: section=hook, phraseBar=3, kickPolicy=balanced
- bar-059 response-line: guitar=active, lead=answer
- bar-060 call-line: section=hook, phraseBar=0, kickPolicy=balanced
- bar-060 response-line: guitar=active, lead=answer
- bar-061 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-061 response-line: guitar=active, lead=foreground
- bar-062 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-062 response-line: guitar=active, lead=foreground
- bar-063 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-063 response-line: guitar=active, lead=foreground
- bar-064 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-064 response-line: guitar=active, lead=foreground
- bar-065 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-065 response-line: guitar=active, lead=foreground
- bar-066 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-066 response-line: guitar=active, lead=foreground
- bar-067 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-067 response-line: guitar=active, lead=foreground
- bar-068 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-068 response-line: guitar=active, lead=foreground
- bar-069 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-069 response-line: guitar=active, lead=foreground
- bar-070 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-070 response-line: guitar=active, lead=foreground
- bar-071 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-071 response-line: guitar=active, lead=foreground
- bar-072 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-072 response-line: guitar=active, lead=foreground
- bar-073 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-073 response-line: guitar=active, lead=foreground
- bar-074 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-074 response-line: guitar=active, lead=foreground
- bar-075 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-075 response-line: guitar=active, lead=foreground
- bar-076 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-076 response-line: guitar=active, lead=foreground
- bar-077 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-077 response-line: guitar=active, lead=foreground
- bar-078 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-078 response-line: guitar=active, lead=foreground
- bar-079 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-079 response-line: guitar=active, lead=foreground
- bar-080 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-080 response-line: guitar=active, lead=foreground
- bar-081 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-081 response-line: guitar=active, lead=foreground
- bar-082 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-082 response-line: guitar=active, lead=foreground
- bar-083 call-line: section=chorus, phraseBar=3, kickPolicy=dense-budgeted
- bar-083 response-line: guitar=active, lead=foreground
- bar-084 call-line: section=chorus, phraseBar=0, kickPolicy=dense-budgeted
- bar-084 response-line: guitar=active, lead=foreground
- bar-085 call-line: section=chorus, phraseBar=1, kickPolicy=dense-budgeted
- bar-085 response-line: guitar=active, lead=foreground
- bar-086 call-line: section=chorus, phraseBar=2, kickPolicy=dense-budgeted
- bar-086 response-line: guitar=active, lead=foreground
- bar-087 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-087 response-line: guitar=support, lead=answer
- bar-088 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-088 response-line: guitar=support, lead=answer
- bar-089 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-089 response-line: guitar=support, lead=answer
- bar-090 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-090 response-line: guitar=support, lead=answer
- bar-091 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-091 response-line: guitar=support, lead=answer
- bar-092 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-092 response-line: guitar=support, lead=answer
- bar-093 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-093 response-line: guitar=support, lead=answer
- bar-094 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-094 response-line: guitar=support, lead=answer
- bar-095 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-095 response-line: guitar=support, lead=answer
- bar-096 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-096 response-line: guitar=support, lead=answer
- bar-097 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-097 response-line: guitar=support, lead=answer
- bar-098 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-098 response-line: guitar=support, lead=answer
- bar-099 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-099 response-line: guitar=support, lead=answer
- bar-100 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-100 response-line: guitar=support, lead=answer
- bar-101 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-101 response-line: guitar=support, lead=answer
- bar-102 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-102 response-line: guitar=support, lead=answer
- bar-103 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-103 response-line: guitar=support, lead=answer
- bar-104 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-104 response-line: guitar=support, lead=answer
- bar-105 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-105 response-line: guitar=support, lead=answer
- bar-106 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-106 response-line: guitar=support, lead=answer
- bar-107 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-107 response-line: guitar=support, lead=answer
- bar-108 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-108 response-line: guitar=support, lead=answer
- bar-109 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-109 response-line: guitar=support, lead=answer
- bar-110 call-line: section=bridge, phraseBar=2, kickPolicy=balanced
- bar-110 response-line: guitar=support, lead=answer
- bar-111 call-line: section=bridge, phraseBar=3, kickPolicy=balanced
- bar-111 response-line: guitar=support, lead=answer
- bar-112 call-line: section=bridge, phraseBar=0, kickPolicy=balanced
- bar-112 response-line: guitar=support, lead=answer
- bar-113 call-line: section=bridge, phraseBar=1, kickPolicy=balanced
- bar-113 response-line: guitar=support, lead=answer
- bar-114 call-line: section=outro, phraseBar=2, kickPolicy=balanced
- bar-114 response-line: guitar=support, lead=residual
- bar-115 call-line: section=outro, phraseBar=3, kickPolicy=balanced
- bar-115 response-line: guitar=support, lead=residual
- bar-116 call-line: section=outro, phraseBar=0, kickPolicy=balanced
- bar-116 response-line: guitar=support, lead=residual
- bar-117 call-line: section=outro, phraseBar=1, kickPolicy=balanced
- bar-117 response-line: guitar=support, lead=residual
- bar-118 call-line: section=outro, phraseBar=2, kickPolicy=balanced
- bar-118 response-line: guitar=support, lead=residual
- bar-119 call-line: section=outro, phraseBar=3, kickPolicy=balanced
- bar-119 response-line: guitar=support, lead=residual
- bar-120 call-line: section=outro, phraseBar=0, kickPolicy=balanced
- bar-120 response-line: guitar=support, lead=residual
- bar-121 call-line: section=outro, phraseBar=1, kickPolicy=balanced
- bar-121 response-line: guitar=support, lead=residual
- bar-122 call-line: section=outro, phraseBar=2, kickPolicy=balanced
- bar-122 response-line: guitar=support, lead=residual
- bar-123 call-line: section=outro, phraseBar=3, kickPolicy=balanced
- bar-123 response-line: guitar=support, lead=residual
- bar-124 call-line: section=outro, phraseBar=0, kickPolicy=balanced
- bar-124 response-line: guitar=support, lead=residual
- bar-125 call-line: section=outro, phraseBar=1, kickPolicy=balanced
- bar-125 response-line: guitar=support, lead=residual
- bar-126 call-line: section=outro, phraseBar=2, kickPolicy=balanced
- bar-126 response-line: guitar=support, lead=residual
- bar-127 call-line: section=outro, phraseBar=3, kickPolicy=balanced
- bar-127 response-line: guitar=support, lead=residual
- bar-128 call-line: section=outro, phraseBar=0, kickPolicy=balanced
- bar-128 response-line: guitar=support, lead=residual
- bar-129 call-line: section=outro, phraseBar=1, kickPolicy=balanced
- bar-129 response-line: guitar=support, lead=residual

## 12. Timbre Assignment Matrix
1. kick-deep -> assigned role-specific duty and section constraints.
2. kick-punch -> assigned role-specific duty and section constraints.
3. kick-ghost -> assigned role-specific duty and section constraints.
4. kick-soft -> assigned role-specific duty and section constraints.
5. kick-tight -> assigned role-specific duty and section constraints.
6. kick-crunch -> assigned role-specific duty and section constraints.
7. snare-body -> assigned role-specific duty and section constraints.
8. snare-bright -> assigned role-specific duty and section constraints.
9. snare-rim -> assigned role-specific duty and section constraints.
10. clap-wide -> assigned role-specific duty and section constraints.
11. hat-closed -> assigned role-specific duty and section constraints.
12. hat-open -> assigned role-specific duty and section constraints.
13. hat-dust -> assigned role-specific duty and section constraints.
14. shaker-grain -> assigned role-specific duty and section constraints.
15. ride-ping -> assigned role-specific duty and section constraints.
16. ride-bell -> assigned role-specific duty and section constraints.
17. perc-wood -> assigned role-specific duty and section constraints.
18. perc-tick -> assigned role-specific duty and section constraints.
19. perc-tom -> assigned role-specific duty and section constraints.
20. perc-blip -> assigned role-specific duty and section constraints.
21. bass-sub -> assigned role-specific duty and section constraints.
22. bass-growl -> assigned role-specific duty and section constraints.
23. bass-glide -> assigned role-specific duty and section constraints.
24. pad-warm -> assigned role-specific duty and section constraints.
25. pad-glass -> assigned role-specific duty and section constraints.
26. pad-noise -> assigned role-specific duty and section constraints.
27. keys-ep -> assigned role-specific duty and section constraints.
28. keys-fm -> assigned role-specific duty and section constraints.
29. chord-stab -> assigned role-specific duty and section constraints.
30. guitar-clean -> assigned role-specific duty and section constraints.
31. guitar-mute -> assigned role-specific duty and section constraints.
32. lead-fm -> assigned role-specific duty and section constraints.
33. lead-glass -> assigned role-specific duty and section constraints.
34. counter-pulse -> assigned role-specific duty and section constraints.
35. arp-chip -> assigned role-specific duty and section constraints.
36. counter-soft -> assigned role-specific duty and section constraints.
37. drone-low -> assigned role-specific duty and section constraints.
38. drone-high -> assigned role-specific duty and section constraints.
39. metal-short -> assigned role-specific duty and section constraints.
40. metal-long -> assigned role-specific duty and section constraints.
41. glitch-digital -> assigned role-specific duty and section constraints.
42. noise-riser -> assigned role-specific duty and section constraints.
43. air-spark -> assigned role-specific duty and section constraints.
44. texture-grain -> assigned role-specific duty and section constraints.

## 13. Refactor-to-Implementation Mapping
- map-001: requirement slot 1 -> module form
- map-002: requirement slot 2 -> module mix
- map-003: requirement slot 3 -> module timbres
- map-004: requirement slot 4 -> module arrangement
- map-005: requirement slot 5 -> module agents
- map-006: requirement slot 6 -> module scheduler
- map-007: requirement slot 7 -> module form
- map-008: requirement slot 8 -> module arrangement
- map-009: requirement slot 9 -> module timbres
- map-010: requirement slot 10 -> module agents
- map-011: requirement slot 11 -> module form
- map-012: requirement slot 12 -> module scheduler
- map-013: requirement slot 13 -> module form
- map-014: requirement slot 14 -> module mix
- map-015: requirement slot 15 -> module agents
- map-016: requirement slot 16 -> module arrangement
- map-017: requirement slot 17 -> module form
- map-018: requirement slot 18 -> module scheduler
- map-019: requirement slot 19 -> module form
- map-020: requirement slot 20 -> module agents
- map-021: requirement slot 21 -> module timbres
- map-022: requirement slot 22 -> module mix
- map-023: requirement slot 23 -> module form
- map-024: requirement slot 24 -> module scheduler
- map-025: requirement slot 25 -> module agents
- map-026: requirement slot 26 -> module mix
- map-027: requirement slot 27 -> module timbres
- map-028: requirement slot 28 -> module arrangement
- map-029: requirement slot 29 -> module form
- map-030: requirement slot 30 -> module scheduler
- map-031: requirement slot 31 -> module form
- map-032: requirement slot 32 -> module arrangement
- map-033: requirement slot 33 -> module timbres
- map-034: requirement slot 34 -> module mix
- map-035: requirement slot 35 -> module agents
- map-036: requirement slot 36 -> module scheduler
- map-037: requirement slot 37 -> module form
- map-038: requirement slot 38 -> module mix
- map-039: requirement slot 39 -> module timbres
- map-040: requirement slot 40 -> module agents
- map-041: requirement slot 41 -> module form
- map-042: requirement slot 42 -> module scheduler
- map-043: requirement slot 43 -> module form
- map-044: requirement slot 44 -> module arrangement
- map-045: requirement slot 45 -> module agents
- map-046: requirement slot 46 -> module mix
- map-047: requirement slot 47 -> module form
- map-048: requirement slot 48 -> module scheduler
- map-049: requirement slot 49 -> module form
- map-050: requirement slot 50 -> module agents
- map-051: requirement slot 51 -> module timbres
- map-052: requirement slot 52 -> module arrangement
- map-053: requirement slot 53 -> module form
- map-054: requirement slot 54 -> module scheduler
- map-055: requirement slot 55 -> module agents
- map-056: requirement slot 56 -> module arrangement
- map-057: requirement slot 57 -> module timbres
- map-058: requirement slot 58 -> module mix
- map-059: requirement slot 59 -> module form
- map-060: requirement slot 60 -> module scheduler
- map-061: requirement slot 61 -> module form
- map-062: requirement slot 62 -> module mix
- map-063: requirement slot 63 -> module timbres
- map-064: requirement slot 64 -> module arrangement
- map-065: requirement slot 65 -> module agents
- map-066: requirement slot 66 -> module scheduler
- map-067: requirement slot 67 -> module form
- map-068: requirement slot 68 -> module arrangement
- map-069: requirement slot 69 -> module timbres
- map-070: requirement slot 70 -> module agents
- map-071: requirement slot 71 -> module form
- map-072: requirement slot 72 -> module scheduler
- map-073: requirement slot 73 -> module form
- map-074: requirement slot 74 -> module mix
- map-075: requirement slot 75 -> module agents
- map-076: requirement slot 76 -> module arrangement
- map-077: requirement slot 77 -> module form
- map-078: requirement slot 78 -> module scheduler
- map-079: requirement slot 79 -> module form
- map-080: requirement slot 80 -> module agents
- map-081: requirement slot 81 -> module timbres
- map-082: requirement slot 82 -> module mix
- map-083: requirement slot 83 -> module form
- map-084: requirement slot 84 -> module scheduler
- map-085: requirement slot 85 -> module agents
- map-086: requirement slot 86 -> module mix
- map-087: requirement slot 87 -> module timbres
- map-088: requirement slot 88 -> module arrangement
- map-089: requirement slot 89 -> module form
- map-090: requirement slot 90 -> module scheduler
- map-091: requirement slot 91 -> module form
- map-092: requirement slot 92 -> module arrangement
- map-093: requirement slot 93 -> module timbres
- map-094: requirement slot 94 -> module mix
- map-095: requirement slot 95 -> module agents
- map-096: requirement slot 96 -> module scheduler
- map-097: requirement slot 97 -> module form
- map-098: requirement slot 98 -> module mix
- map-099: requirement slot 99 -> module timbres
- map-100: requirement slot 100 -> module agents
- map-101: requirement slot 101 -> module form
- map-102: requirement slot 102 -> module scheduler
- map-103: requirement slot 103 -> module form
- map-104: requirement slot 104 -> module arrangement
- map-105: requirement slot 105 -> module agents
- map-106: requirement slot 106 -> module mix
- map-107: requirement slot 107 -> module form
- map-108: requirement slot 108 -> module scheduler
- map-109: requirement slot 109 -> module form
- map-110: requirement slot 110 -> module agents
- map-111: requirement slot 111 -> module timbres
- map-112: requirement slot 112 -> module arrangement
- map-113: requirement slot 113 -> module form
- map-114: requirement slot 114 -> module scheduler
- map-115: requirement slot 115 -> module agents
- map-116: requirement slot 116 -> module arrangement
- map-117: requirement slot 117 -> module timbres
- map-118: requirement slot 118 -> module mix
- map-119: requirement slot 119 -> module form
- map-120: requirement slot 120 -> module scheduler

## 14. Risks and Mitigations
- risk-1: Over-density in chorus despite role budgets.
  mitigation-1: enforce section budgets + motif recall points + transition protocol checks.
- risk-2: Too much randomization creating unstable motif identity.
  mitigation-2: enforce section budgets + motif recall points + transition protocol checks.
- risk-3: Kick timbre contrast may become too obvious and artificial.
  mitigation-3: enforce section budgets + motif recall points + transition protocol checks.
- risk-4: Bridge may lose momentum if low-end is over-thinned.
  mitigation-4: enforce section budgets + motif recall points + transition protocol checks.
- risk-5: Call/response may become predictable if timing offsets are fixed.
  mitigation-5: enforce section budgets + motif recall points + transition protocol checks.
- risk-6: Texture layer can mask harmonic intelligibility if unmanaged.
  mitigation-6: enforce section budgets + motif recall points + transition protocol checks.
- risk-7: Excessive per-bar mutation can break listener memory anchors.
  mitigation-7: enforce section budgets + motif recall points + transition protocol checks.

## 15. Brief Implementation Notes
Implementation is expected to remain modular and traceable to this design.
Primary modules should expose small deterministic interfaces and avoid hidden cross-module mutation.
ConductorScheduler is the single source of scheduling truth.
Agent subclasses should stay specialist and avoid scope creep.
Metrics (timbre count, unique kick signatures, motivation trace) are mandatory for validation.

## 16. Closing Statement
This blueprint intentionally combines artistic narrative with software architecture constraints.
The target outcome is not maximal complexity but coherent emotional movement across time.
A band-like system succeeds when each role is audible, purposeful, and context-aware.
