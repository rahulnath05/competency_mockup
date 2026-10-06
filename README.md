# CompetencyOS v2 — Workspace

A second, independently designed HTML version of the Competency-Based Learning & Development
platform, built to match the visual language of the reference Figma build
(<https://latte-stroke-40295506.figma.site/>) and then extended with materially more detail.

**Open `index.html` in any browser.** No build step, no server, no dependencies. An internet
connection only improves typography (DM Sans / Manrope from Google Fonts); the layout falls back
to system fonts offline.

> v1 of this design lives in [`../ld-platform/`](../ld-platform/index.html) — a navy/orange
> documentation-style build. v2 is the product-shaped workspace below.

## What changed versus v1

| | v1 | v2 |
|---|---|---|
| Visual language | Navy + orange, documentation layout | Canvas `#f5f7f4`, deep-green sidebar `#172c2a`, teal `#147e6f`, coral `#e8785d`, amber `#ca7c27`; DM Sans + Manrope display face |
| Information architecture | Long scrolling document with persona tabs | App shell: fixed sidebar workspace nav, sticky topbar (search, notifications, date), persona switcher, module pages |
| Data | Illustrative slices | 10 people, 6 competencies, 12 content resources, benchmark matrix across 5 role levels, report register, programme analytics |
| Interaction depth | Assessment + plan + report card | All of that **plus** competency catalogue with benchmark matrix drawer, people directory with per-person skill drill-down, reports with outcome donut and saved/scheduled reports, content library with health filters, live search with empty states |
| Assessment | 4-step visual walkthrough | Working IRT engine with θ/SE readout, engine event log, gap analysis, plan loop, remedial branching, report-card verdict |

## Views

**Workspace**

1. **Overview** — persona-aware dashboard: journey strip, four metric cards (first one featured
   in deep green, mirroring the reference), then two dashboard grids of panels.
   - *Candidate* (Aarav Mehta): learning plan with complete / active / locked sections that you can
     actually complete, adaptive re-assessment card, skill table, upcoming actions.
   - *People Manager* (Vikram Shah): team progress with nudge buttons, recommended actions,
     team skill-gap bars, upcoming 1:1s.
   - *Competency Leader* (Ananya Rao): portfolio metrics, competency heatmap (skill × role level,
     1–4 proficiency), learning-momentum line chart, people-to-watch table.
   - *L&D Team* (Priya Deshmukh): programme metrics, content health, bottleneck skills, provider
     mix, link-validation queue.
2. **Competencies** — catalogue of 6 competencies with structure, version, status and assignment
   volume; click a row for the benchmark matrix drawer (editable target proficiency per role),
   version history and publish flow.
3. **People** — 248-person directory (10 shown) with competency/status filters, nudge actions and a
   per-person drawer showing assessed versus target proficiency for every skill.
4. **Reports** — *persona-scoped* (see below): the same route renders a different report, heading,
   metrics and action set for each persona. The sidebar item renames itself too
   (*My reports* / *Team reports* / *Competency reports* / *Programme reports*).

   | Persona | Scope | What the report shows |
   |---|---|---|
   | **Candidate** | my record | current-cycle skill table, how the verdict is calculated, previous report cards, what the manager can see, upcoming reports |
   | **People Manager** | my team (7) | team report cards, skill gaps in the team, team vs organisation comparison, recommended follow-ups (escalate a Fail, propose a remedial plan, recognise successes), team-scoped saved reports |
   | **Competency Leader** | Data Analytics portfolio | success rate by role level, skill-level outcomes, benchmark version effectiveness (v3.2 vs v3.1 vs v3.0), at-risk cohorts with actions, cards awaiting review |
   | **L&D Team** | organisation (all 6 competencies) | outcome distribution donut across 12,480 cards, pass rate by content provider, programme funnel, time-to-close by skill, scheduled distribution |

   Switching persona while on Reports re-renders the view in place (no navigation needed).
5. **Content library** — 12 mapped resources with provider, tracking type (LTI / SCORM / URL),
   health state and learner counts; content-health table and coverage-by-skill bars.
6. **Assessment lab** — the full engine: adaptive item selection, live θ and standard error,
   stopping rule at SE < 0.30, gap analysis, generated learning plan, self-reported completion,
   re-assessment that either marks the skill Met or inserts remedial content and loops, and the
   final report card with a Success / Partial / Fail verdict.

**Blueprint** (carried over from v1, restyled): Architecture (six-layer service map + module
responsibilities + integrations), Data model (15 entities, keys, relationships, indexes),
Workflows (9.1–9.4 plus the eight-node mastery loop), Non-functional requirements (quality
attributes, assumptions, constraints, glossary), Roadmap (four phases, open questions, future
enhancements, completion funnel and bottleneck analytics).

## Notification centre (per persona)

The bell in the topbar opens an inbox that belongs to the **currently selected persona** — different
items, different unread count, different actions.

- **Badge** shows that persona's unread count and hides itself at zero; each persona pill in the
  switcher carries a dot while it has unread items, so you can see at a glance that other personas
  have their own queue.
- **Panel** has the persona's name as a scope tag, *All / Unread* filters, per-item type icons
  (teal / amber / red by severity), timestamps, a *Mark all read* action and delivery settings.
- **Actions deep-link into the app**: *Start re-assessment* → Assessment lab, *Nudge Meera* → sends
  the nudge, *Review Arjun* → opens the person drawer, *Open benchmark* → the benchmark matrix,
  *Run validation* → the taxonomy report. Clicking a row marks it read.

Seeded inboxes (5 items each, 3 unread):

| Persona | Examples |
|---|---|
| Candidate | benchmark assigned · section due in 3 days · re-assessment unlocked · report card preview · content mapped |
| People Manager | report card ready (Diya Banerjee) · Meera Iyer behind · re-assessment failed (Arjun) · 1:1 confirmed · team summary |
| Competency Leader | benchmark published · validation warnings · 9 overdue across 4 competencies · cards awaiting review · skill requests pending |
| L&D Team | 12 content issues · content mapped outside the taxonomy · quarterly report ready · bottleneck skill · digest sent |

The inbox is also **event-driven**: doing things elsewhere in the prototype pushes notifications to
the personas they affect, and only after the action actually succeeds.

| You do this | Notified |
|---|---|
| Publish a benchmark (Manager role) | leader *and* manager, plus L&D when a coverage waiver was recorded |
| Publish a benchmark for Associate / Sr. Associate | candidate *"assigned to you"* |
| Mark a plan section complete | candidate (re-assessment unlocked) + manager (progress) |
| Pass a re-assessment | candidate (skill met) + manager (team update) |
| Fail a re-assessment | candidate (remedial added) + manager (needs support) |
| Nudge Aarav Mehta | candidate ("Vikram Shah nudged you") |
| Request a taxonomy addition | L&D + leader |
| Run taxonomy validation with findings | L&D, plus the leader when there are blocking errors |
| Attempt a blocked publish | nobody — blocked actions send no notifications |

## Benchmark creation & taxonomy validation

Both flows are fully implemented, not stubs.

### New benchmark → 3-step wizard (modal)

`Competencies → New benchmark` (or any competency drawer → *Publish & assign*) opens a wizard:

1. **Scope** — competency, role, plan window and a *Base on* choice (published targets or a blank
   matrix at Intermediate). Changing competency reloads that competency's own matrix and taxonomy.
2. **Skill targets** — an editor grid of every skill × the five role levels (B / I / A / E). You can
   add skills from the taxonomy or type a new skill name, remove skills, and edit any target. Checks
   re-run live on every change and are listed inline.
3. **Review & assign** — the matrix as it will be published, the new version number, the projected
   audience for the selected role, and the validation results. **Publish is blocked while any
   blocking error remains.**

Publishing writes real state: the competency's version is bumped (e.g. Data Analytics v3.2 → **v3.3**),
the previous version is marked *Superseded* in the version history, the catalogue row gets a **New**
tag with the new version and an updated assignment count, and an entry is appended to the publish
audit log. The assignment fan-out (`benchmark.published` → matching → fan-out → notification →
version recorded) is then shown as a staged feed.

### Validate taxonomy → the check engine

`Competencies → Validate taxonomy` runs every check across all six benchmarks; the button inside a
competency drawer scopes the same engine to that competency. Each run produces a report with a
checks-run / passed / warnings / errors summary strip and a per-check list:

| Check | Level | Fails when |
|---|---|---|
| Taxonomy mapping | **error** (hard block) | a skill is not in the curated taxonomy for that competency |
| Duplicate skills | **error** | the same skill appears twice in the matrix |
| Target proficiency | **error** | a skill has no target for one of the five role levels |
| Learning content coverage | **error** (waivable) | a skill has no mapped learning resource |
| Target regression | warning | the draft lowers a target that is currently published for that role |
| Level progression | warning | targets decrease as seniority increases |
| Version status | warning | employees are assigned while the version is Draft or in Review |
| Matrix size | warning | fewer than three skills |

The catalogue-wide run adds two cross-cutting checks: content mapped to a skill that is in no
taxonomy (**Prompt engineering** is deliberately in that state) and pending skill-addition requests.
Unknown skills can be pushed to curation from the report via *Request taxonomy addition*, and an
unmapped-content error can be **waived** with an explicit acknowledgement — the waiver is recorded on
the publish audit log and reported as its own step in the fan-out feed. Taxonomy errors can never be
waived.

## Interactions worth trying

- **Competencies → New benchmark** → take the wizard to step 2, add *"Quantum analytics"* as a custom
  skill → the taxonomy check fails and *Review & publish* is disabled. Tick the coverage waiver, try to
  publish, and see that only the waivable error clears. Remove the unknown skill, publish, and watch the
  catalogue row update to v3.3 with a **New** tag.
- **Competencies → Validate taxonomy** → the organisation-wide report; click any competency row to drill in.
- Switch persona in the pill switcher — the Overview **and Reports** views follow the persona; the sidebar
  item renames itself (*My reports* → *Team reports* → *Competency reports* → *Programme reports*).
- Sit on **Reports** and flip the persona — the report swaps in place: personal record → team outcomes →
  competency outcomes → programme outcomes, each with its own metrics, panels and export actions.
- **Notifications** → open the bell as the Candidate, then flip to the Competency Leader: the inbox,
  badge and actions all swap. Publish a benchmark as the leader and the Manager/Leader/L&D inboxes gain a
  new item; fail a re-assessment in the Assessment lab and both the candidate and their manager are
  notified.
- Candidate → **Continue learning** → complete a plan section → the next one unlocks and a re-assessment is triggered.
- **Assessment lab** → start, answer items (θ and SE move after each response) → wrong answers produce
  a real gap and a plan; a re-assessment failure inserts remedial content and loops.
- **Competencies** → click a row → edit target proficiency per role, then *Validate taxonomy* on that version.
- **People** → click anyone → skill-by-skill assessed vs target → nudge, 1:1, report card, flag.
- Type in the topbar search to filter the current module, or ⌘K / Ctrl+K to focus it. Empty states read
  `No people match “…”` like the reference.

## Files

- `index.html` — app shell, all eleven views and the wizard modal container
- `styles.css` — the v2 design system (tokens taken from the reference bundle's `:root`: ink, canvas,
  navy, teal, coral, amber, surface, line + the panel/metric/heatmap/journey/donut patterns, plus the
  wizard modal and validation-report components)
- `app.js` — router, data, renderers, the IRT assessment engine, the benchmark wizard and the
  taxonomy validation engine

## Verification

Browser automation is blocked in this sandbox (headless Chrome cannot start), so `app.js` was
exercised headlessly instead: a mini-DOM harness in `../.verify/smoke-v2.js` boots the app, renders
all four persona dashboards and all eleven views, applies every filter and search, opens all
drawers, runs both assessment branches (all-wrong → gap → plan → fail → pass; all-correct → no gap),
drives the whole benchmark wizard (regression warning → blank/published base → unknown skill →
blocked publish → waiver → successful publish → version bump and audit log), exercises the
notification centre (per-persona inboxes, badge accuracy, filters, mark-read isolation, event
fan-out on publish, and that a blocked publish notifies nobody), and checks the generated markup is
balanced. Run it with:

```
node ../.verify/smoke-v2.js
```

The app also exposes a debug surface for console or automation use:

```js
CompetencyOS.setPersona('leader');
CompetencyOS.go('people');
CompetencyOS.lab.start(); CompetencyOS.lab.answer(0); CompetencyOS.lab.submit(true);

// benchmark wizard
CompetencyOS.benchmark.open('Data Analytics');
CompetencyOS.benchmark.setField('role', 'Director');
CompetencyOS.benchmark.step(2);
CompetencyOS.benchmark.addSkill('Quantum analytics');   // not in the taxonomy
CompetencyOS.validation.draft();                        // raw check list
CompetencyOS.benchmark.publish();                       // refused while blocked
CompetencyOS.benchmark.removeSkill(5);
CompetencyOS.benchmark.publish();                       // v3.3 published + assigned

// validation
CompetencyOS.validation.competency('DA');
CompetencyOS.validation.report();                       // whole-catalogue report

// notifications
CompetencyOS.notifications.inbox('leader');             // that persona's items
CompetencyOS.notifications.unread('manager');           // unread count
CompetencyOS.notifications.toggle();                    // open the panel
CompetencyOS.notifications.filter('unread');
CompetencyOS.notifications.markAllRead();
CompetencyOS.notifications.push('candidate', { type: 'due', title: 'Ad-hoc', body: 'Demo push' });
```

## Attribution

All sample data (people, competencies, content, metrics) is invented for the prototype. The visual
language and information architecture were derived by inspecting the published reference bundle at
`latte-stroke-40295506.figma.site` (design tokens, layout CSS and content model); no code or assets
from that bundle are included here.
