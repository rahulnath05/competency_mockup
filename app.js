/* ==========================================================================
   CompetencyOS v2 — workspace interactions
   Vanilla ES2019. All state in memory; nothing is persisted.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ICONS = {
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    layers: '<path d="M12 3 3 7.4l9 4.4 9-4.4L12 3Z"/><path d="M3 12.4 12 16.8l9-4.4"/><path d="M3 17 12 21.4 21 17"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.6 20a5.4 5.4 0 0 1 10.8 0"/><path d="M16 5.6a3 3 0 0 1 0 5.7"/><path d="M17.6 20a5.4 5.4 0 0 0-2-4.2"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21.5 20H2.5"/>',
    book: '<path d="M4 4.6A1.6 1.6 0 0 1 5.6 3H19v15H5.6A1.6 1.6 0 0 0 4 19.6V4.6Z"/><path d="M4 19.6A1.6 1.6 0 0 1 5.6 18H21v3H5.6A1.6 1.6 0 0 1 4 19.6Z"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M18.6 16.4l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1"/>',
    check: '<path d="M20 6.5 9.5 17 4 11.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3 2"/>',
    trend: '<path d="M3 16.5 9 10l4 3.5 8-8"/><path d="M21 10.5V5.5h-5"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Z"/><path d="M10 18a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
    menu: '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
    arrow: '<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    alert: '<path d="M12 4l9 16H3l9-16Z"/><path d="M12 10v4"/><path d="M12 17.2h.01"/>',
    file: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    play: '<path d="M7 4.6 19 12 7 19.4V4.6Z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 5h11l-1.6 4L16 13H5"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>'
  };
  const icon = (n, s) => '<svg width="' + (s || 16) + '" height="' + (s || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>';

  window.toast = function (msg, detail) {
    const stack = $('#toastStack');
    const el = document.createElement('div');
    el.className = 'toast' + (/fail|broken|overdue|behind/i.test(msg) ? ' warn' : '');
    el.innerHTML = icon(/fail|broken|overdue|behind/i.test(msg) ? 'alert' : 'check', 16) +
      '<div><strong style="color:#fff">' + esc(msg) + '</strong>' + (detail ? '<div style="color:#b8c8dc;font-size:11px;margin-top:2px">' + esc(detail) + '</div>' : '') + '</div>';
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, 4600);
  };
  window.newBenchmark = function () {
    toast('New benchmark', 'Choose a competency and role, set target proficiency per skill, then publish.');
    go('competencies');
  };

  /* ---------------------------------------------------------------- data */
  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const ROLES = ['Associate', 'Sr. Associate', 'Manager', 'Sr. Manager', 'Director'];

  const PERSONAS = {
    leader: {
      label: 'Competency Leader', initials: 'AR', kind: 'leader',
      eyebrow: 'Competency portfolio', greeting: 'Good morning, Ananya.',
      lede: 'Monitor readiness, benchmark health and outcomes across your competency.',
      action: 'Create benchmark',
      journeyTitle: 'Benchmark cycle', journey: [
        ['Define benchmark', 'Role-based targets', 'complete'],
        ['Validate taxonomy', 'Skills and levels', 'complete'],
        ['Publish & assign', '248 employees', 'active'],
        ['Monitor readiness', 'Live progress', ''],
        ['Review outcomes', 'Report cards', '']
      ]
    },
    candidate: {
      label: 'Candidate', initials: 'AM', kind: 'candidate',
      eyebrow: 'My development plan', greeting: 'Keep going, Aarav.',
      lede: 'You\u2019re making strong progress toward your Senior Associate benchmark.',
      action: 'Continue learning',
      journeyTitle: 'Current journey', journey: [
        ['Initial assessment', 'Adaptive IRT', 'complete'],
        ['Gap analysis', '3 skills identified', 'complete'],
        ['Learning plan', 'Section 3 of 5', 'active'],
        ['Re-assessment', 'After this section', ''],
        ['Report card', 'Final outcome', '']
      ]
    },
    manager: {
      label: 'People Manager', initials: 'VS', kind: 'manager',
      eyebrow: 'Team readiness', greeting: 'Good morning, Vikram.',
      lede: 'See where your team is thriving and where timely support can help.',
      action: 'Schedule 1:1',
      journeyTitle: 'Team review', journey: [
        ['Review team', '12 direct reports', 'complete'],
        ['Spot risk', '2 need support', 'active'],
        ['Intervene', 'Nudge or 1:1', ''],
        ['Track progress', 'Weekly review', ''],
        ['Review outcomes', 'Report cards', '']
      ]
    },
    ld: {
      label: 'L&D Team', initials: 'PD', kind: 'ld',
      eyebrow: 'Program operations', greeting: 'Good morning, Priya.',
      lede: 'Track content quality, organization-wide outcomes and skill bottlenecks.',
      action: 'Map content',
      journeyTitle: 'Program cycle', journey: [
        ['Map content', 'Internal & public', 'complete'],
        ['Validate links', 'URL, LTI, SCORM', 'active'],
        ['Monitor health', 'Completion & pass', ''],
        ['Find bottlenecks', 'Skill-level trends', ''],
        ['Recommend', 'Content & benchmark', '']
      ]
    }
  };

  const SKILL_SETS = {
    'Data Analytics': ['Python', 'SQL', 'Data visualization', 'Statistical analysis', 'Data storytelling'],
    'Cloud Engineering': ['Cloud analytics', 'Terraform', 'SQL', 'Data modelling', 'Security fundamentals'],
    'Product Management': ['Roadmapping', 'Stakeholder management', 'Data storytelling', 'Discovery practice', 'Metrics design'],
    'Digital Strategy': ['Data visualization', 'Business case modelling', 'Market analysis', 'Change management', 'Storytelling'],
    'Risk & Compliance': ['Statistical analysis', 'Controls design', 'Regulatory reporting', 'Audit readiness', 'Data governance'],
    'Emerging Technologies': ['Python', 'Streaming architectures', 'MLOps', 'Cloud analytics', 'Prompt engineering']
  };

  const PEOPLE = [
    { id: 'aarav', name: 'Aarav Mehta', initials: 'AM', role: 'Senior Associate', comp: 'Data Analytics', status: 'On track', progress: 62, focus: 'Python', due: '12 days', tint: 'peach' },
    { id: 'meera', name: 'Meera Iyer', initials: 'MI', role: 'Manager', comp: 'Data Analytics', status: 'Behind', progress: 41, focus: 'Data storytelling', due: '6 days', urgent: true, tint: 'blue' },
    { id: 'arjun', name: 'Arjun Malhotra', initials: 'AJ', role: 'Manager', comp: 'Data Analytics', status: 'Behind', progress: 47, focus: 'Data modelling', due: '4 days', urgent: true, tint: 'amber' },
    { id: 'rohan', name: 'Rohan Kulkarni', initials: 'RK', role: 'Associate', comp: 'Cloud Engineering', status: 'On track', progress: 74, focus: 'SQL', due: '18 days', tint: 'green' },
    { id: 'neha', name: 'Neha Joshi', initials: 'NJ', role: 'Senior Associate', comp: 'Cloud Engineering', status: 'On track', progress: 88, focus: 'Cloud analytics', due: '9 days', tint: 'green' },
    { id: 'kavya', name: 'Kavya Nair', initials: 'KN', role: 'Senior Manager', comp: 'Product Management', status: 'Completed', progress: 100, focus: 'All skills met', due: 'Closed', tint: 'purple' },
    { id: 'ishaan', name: 'Ishaan Verma', initials: 'IV', role: 'Manager', comp: 'Digital Strategy', status: 'On track', progress: 58, focus: 'Data visualization', due: '21 days', tint: 'blue' },
    { id: 'diya', name: 'Diya Banerjee', initials: 'DB', role: 'Associate', comp: 'Risk & Compliance', status: 'Failed', progress: 33, focus: 'Statistical analysis', due: 'Ended', tint: 'coral' },
    { id: 'leah', name: 'Leah Fernandes', initials: 'LF', role: 'Associate', comp: 'Emerging Technologies', status: 'On track', progress: 55, focus: 'Streaming architectures', due: '30 days', tint: 'purple' },
    { id: 'sanjay', name: 'Sanjay Kapoor', initials: 'SK', role: 'Director', comp: 'Data Analytics', status: 'On track', progress: 91, focus: 'Data governance', due: '26 days', tint: 'peach' }
  ];

  const COMPETENCIES = [
    { code: 'DA', name: 'Data Analytics', skills: 24, roles: 5, version: 'v3.2', status: 'Published', assigned: 248, owner: 'Ananya Rao', updated: '22 May 2025', inDraft: 2 },
    { code: 'CE', name: 'Cloud Engineering', skills: 28, roles: 5, version: 'v2.3', status: 'Published', assigned: 187, owner: 'Ananya Rao', updated: '19 May 2025', inDraft: 1 },
    { code: 'PM', name: 'Product Management', skills: 21, roles: 5, version: 'v4.0', status: 'Published', assigned: 142, owner: 'Priya Deshmukh', updated: '16 May 2025', inDraft: 0 },
    { code: 'DS', name: 'Digital Strategy', skills: 16, roles: 4, version: 'v2.1', status: 'Draft', assigned: 0, owner: 'Priya Deshmukh', updated: '14 May 2025', inDraft: 3 },
    { code: 'RC', name: 'Risk & Compliance', skills: 18, roles: 6, version: 'v1.4', status: 'Review', assigned: 96, owner: 'Ananya Rao', updated: '11 May 2025', inDraft: 2 },
    { code: 'ET', name: 'Emerging Technologies', skills: 12, roles: 3, version: 'v1.0', status: 'Draft', assigned: 0, owner: 'Priya Deshmukh', updated: '08 May 2025', inDraft: 4 }
  ];

  /* benchmark matrix: skill -> target level index (1-4) per role */
  const BENCHMARK = [
    { skill: 'Python', type: 'Technical', targets: [2, 3, 3, 4, 4] },
    { skill: 'SQL', type: 'Technical', targets: [2, 3, 4, 4, 4] },
    { skill: 'Data visualization', type: 'Technical', targets: [1, 2, 3, 3, 4] },
    { skill: 'Statistical analysis', type: 'Technical', targets: [1, 2, 3, 4, 4] },
    { skill: 'Data storytelling', type: 'Business', targets: [2, 3, 3, 4, 4] }
  ];

  const CONTENT = [
    { title: 'Python for Data Analysis', skill: 'Python', level: 'Intermediate', provider: 'Coursera', type: 'URL', health: 'Healthy', validated: '12 May 2025', learners: 1542, mapped: 4 },
    { title: 'Advanced SQL Optimisation', skill: 'SQL', level: 'Advanced', provider: 'Internal Academy', type: 'SCORM', health: 'Healthy', validated: '18 May 2025', learners: 1204, mapped: 3 },
    { title: 'Executive Data Storytelling', skill: 'Data storytelling', level: 'Advanced', provider: 'LinkedIn Learning', type: 'LTI', health: 'Review', validated: '02 Apr 2025', learners: 986, mapped: 5 },
    { title: 'Statistics Essentials', skill: 'Statistical analysis', level: 'Beginner', provider: 'Internal Academy', type: 'SCORM', health: 'Broken', validated: '19 Jan 2025', learners: 1284, mapped: 2 },
    { title: 'Power BI Dashboard Design', skill: 'Data visualization', level: 'Intermediate', provider: 'Microsoft Learn', type: 'URL', health: 'Healthy', validated: '15 May 2025', learners: 1104, mapped: 4 },
    { title: 'Applied Data Analysis', skill: 'Python', level: 'Intermediate', provider: 'Coursera', type: 'URL', health: 'Healthy', validated: '20 May 2025', learners: 876, mapped: 3 },
    { title: 'Statistical Modelling', skill: 'Statistical analysis', level: 'Advanced', provider: 'Internal lab', type: 'LTI', health: 'Outdated', validated: '07 Feb 2025', learners: 642, mapped: 2 },
    { title: 'Working with pandas', skill: 'Python', level: 'Beginner', provider: 'Internal academy', type: 'SCORM', health: 'Healthy', validated: '21 May 2025', learners: 1490, mapped: 4 },
    { title: 'Streaming Architectures', skill: 'Streaming architectures', level: 'Advanced', provider: 'Confluent', type: 'URL', health: 'Review', validated: '28 Mar 2025', learners: 318, mapped: 1 },
    { title: 'Terraform Fundamentals', skill: 'Terraform', level: 'Intermediate', provider: 'A Cloud Guru', type: 'LTI', health: 'Healthy', validated: '17 May 2025', learners: 704, mapped: 3 },
    { title: 'Regulatory Reporting Basics', skill: 'Regulatory reporting', level: 'Beginner', provider: 'Internal Academy', type: 'SCORM', health: 'Outdated', validated: '11 Feb 2025', learners: 452, mapped: 2 },
    { title: 'Prompt Engineering for Analysts', skill: 'Prompt engineering', level: 'Intermediate', provider: 'Internal lab', type: 'URL', health: 'Healthy', validated: '19 May 2025', learners: 611, mapped: 2 }
  ];

  const SAVED_REPORTS = [
    ['Quarterly competency outcomes', 'Updated 22 May · PDF'],
    ['Benchmark effectiveness', 'Updated 18 May · XLSX'],
    ['Learning content performance', 'Updated 12 May · PDF'],
    ['Skill gap heatmap by role', 'Updated 09 May · XLSX']
  ];

  const RECENT_CARDS = [
    ['Kavya Nair', 'KN', 'purple', 'Product Management', 'Success', '6 of 6 skills met', '20 May 2025'],
    ['Arjun Malhotra', 'AJ', 'amber', 'Data Analytics', 'Partial', '4 of 6 skills met', '18 May 2025'],
    ['Neha Joshi', 'NJ', 'green', 'Cloud Engineering', 'Success', '8 of 8 skills met', '17 May 2025'],
    ['Meera Iyer', 'MI', 'blue', 'Data Analytics', 'Partial', '3 of 6 skills met', '16 May 2025'],
    ['Diya Banerjee', 'DB', 'coral', 'Risk & Compliance', 'Fail', '2 of 6 skills met', '14 May 2025'],
    ['Sanjay Kapoor', 'SK', 'peach', 'Data Analytics', 'Success', '5 of 5 skills met', '13 May 2025']
  ];

  const SCHEDULED = [
    ['Weekly programme digest', 'Mon 07:00'],
    ['Monthly competency roll-up', '1st, 08:00'],
    ['Quarterly ROI pack', 'Next: 01 Jul'],
    ['Broken content alert', 'On detection']
  ];

  const TTC = [['Power BI', 22], ['Data storytelling', 27], ['Python', 31], ['Data visualization', 29], ['Statistical analysis', 44], ['Data modelling', 38], ['Streaming architectures', 67]];

  const BOTTLENECK = [
    ['Streaming architectures', 41, 318], ['Statistical analysis', 28, 1284], ['Data storytelling', 24, 986],
    ['Python', 19, 1542], ['Data visualization', 12, 1104], ['SQL', 9, 1204]
  ];

  const FUNNEL = [
    ['Benchmark assigned', 12480, 100], ['Initial assessment completed', 11240, 90],
    ['Gaps identified', 9860, 79], ['Learning plan started', 8930, 72],
    ['Plan completed', 7410, 59], ['Re-assessment passed', 6890, 55], ['Report card published', 6540, 52]
  ];

  /* candidate plan (learning-plan sections) */
  const PLAN = [
    { title: 'Working with pandas', source: 'Internal academy · 3h 20m', state: 'done' },
    { title: 'Applied data analysis', source: 'Coursera · 2h 10m', state: 'done' },
    { title: 'Statistical modelling', source: 'Internal lab · 1h 45m', state: 'active' },
    { title: 'Data storytelling masterclass', source: 'LinkedIn Learning · 2h 30m', state: 'locked' },
    { title: 'Python performance clinic', source: 'Internal · 3h 00m', state: 'locked' }
  ];

  const CAND_SKILLS = [
    { name: 'Python', target: 'Advanced', assessed: 'Intermediate', status: 'Learning' },
    { name: 'SQL', target: 'Advanced', assessed: 'Advanced', status: 'Met' },
    { name: 'Data visualization', target: 'Intermediate', assessed: 'Advanced', status: 'Met' },
    { name: 'Statistical analysis', target: 'Intermediate', assessed: 'Intermediate', status: 'Learning' },
    { name: 'Data storytelling', target: 'Advanced', assessed: null, status: 'Not started' }
  ];

  const QUESTIONS = [
    { b: -1.2, skill: 'Python', type: 'MCQ', text: 'Which construct returns a single DataFrame of group-wise aggregates in one pass?',
      opts: ["df.groupby('region').agg({'revenue': 'sum'})", "df.apply(lambda r: r.revenue, axis=1)", "df.pivot(index='region', columns='revenue')", "df.merge(df, on='region')"], a: 0,
      why: 'groupby(...).agg(...) computes all requested aggregates in a single pass.' },
    { b: -0.5, skill: 'Python', type: 'MCQ', text: "A colleague writes df[df.amount > 0]['tax'] = 0.2 and gets a SettingWithCopyWarning. What is the correct fix?",
      opts: ['Suppress the warning with pd.options.mode.chained_assignment = None', 'Call .copy() on the filtered frame first', "df.loc[df.amount > 0, 'tax'] = 0.2", 'Cast the column with .astype(float) before assigning'], a: 2,
      why: 'A single .loc assignment targets the parent frame directly and avoids chained assignment.' },
    { b: 0.1, skill: 'Python', type: 'Scenario', text: 'You need a running 7-day average of daily revenue per store that keeps the original row count. Which approach is correct?',
      opts: ['df.groupby("store")["revenue"].rolling(7).mean().reset_index()', 'df.groupby("store")["revenue"].transform(lambda s: s.rolling(7, min_periods=1).mean())', 'df["revenue"].rolling(7).mean().groupby(df["store"]).sum()', 'df.resample("7D").mean()'], a: 1,
      why: 'transform keeps the index aligned so the result can be assigned back per store.' },
    { b: 0.6, skill: 'Statistical analysis', type: 'Scenario', text: 'A pipeline must reprocess a monthly-partitioned dataset idempotently as it grows. Which design is most appropriate?',
      opts: ['Append every run and deduplicate downstream', 'Truncate the whole target table and reload every month', 'Overwrite only the affected month partition, keyed on (store, date)', 'Write to a new table per run and union at read time'], a: 2,
      why: 'Partition-scoped overwrite keyed on the natural key is idempotent and cheap to rerun.' },
    { b: 1.0, skill: 'Python', type: 'Coding', text: 'A nested Python loop over 4 million rows is too slow. Which rewrite keeps results identical with the largest gain?',
      opts: ['Swap the loops so the shorter one is inner', 'Precompute boolean masks and use np.where with broadcasting', 'Wrap the loop in multiprocessing.Pool with 8 workers', 'Convert the frame to a list of dicts before iterating'], a: 1,
      why: 'Vectorised masking removes per-row interpreter overhead entirely; multiprocessing still pays it 4 million times.' },
    { b: 1.5, skill: 'Statistical analysis', type: 'Scenario', text: 'You must guarantee exactly-once aggregates from a streaming source with late, out-of-order events. What combination is required?',
      opts: ['At-least-once delivery plus nightly deduplication', 'Event-time watermarks with allowed lateness and an idempotent upsert sink', 'Processing-time windows with a 1-minute trigger', 'Batch reprocessing of the raw topic each hour'], a: 1,
      why: 'Watermarks bound the window, allowed lateness admits stragglers, and an idempotent sink makes replays safe.' }
  ];

  /* ---------------------------------------------------------------- state */
  const state = {
    view: 'overview', persona: 'candidate', query: '',
    plan: PLAN.map((p) => Object.assign({}, p)),
    versions: {},      // per-competency benchmark version history
    publishLog: [],    // benchmarks published in this session
    notifs: {},        // per-persona notification inboxes
    notifSeq: 0,
    notifFilter: 'all'
  };

  const level = (i) => LEVELS[(i || 1) - 1];
  const statusClass = (s) => ({ 'On track': 'on-track', Behind: 'behind', Completed: 'completed', Failed: 'failed' }[s] || 'completed');
  const healthClass = (h) => ({ Healthy: 'healthy', Review: 'review', Outdated: 'outdated', Broken: 'broken' }[h] || 'healthy');

  /* ======================================================================
     NOTIFICATION CENTRE — every persona has its own inbox, and the demo
     events elsewhere in the app push into the right inboxes as they happen.
     ====================================================================== */

  const NOTIF_ICON = {
    assigned: 'target', due: 'clock', assess: 'spark', card: 'file', content: 'book',
    risk: 'alert', reassess: 'alert', oneonone: 'calendar', team: 'users', publish: 'check',
    validate: 'check', cohort: 'users', request: 'layers', broken: 'alert', mapped: 'grid',
    report: 'file', bottleneck: 'trend', schedule: 'calendar', nudge: 'bell'
  };
  const NOTIF_TONE = { risk: 'warn', reassess: 'warn', due: 'warn', validate: 'warn', mapped: 'warn', bottleneck: 'warn', nudge: 'warn', broken: 'bad' };

  const NOTIFICATION_SEED = {
    candidate: [
      { type: 'assigned', unread: true, time: '2h ago', title: 'Benchmark assigned to you',
        body: 'Data Analytics · Senior Associate v3.2 was assigned by Ananya Rao. Initial assessment due in 5 days.',
        action: { label: 'Open my plan', onclick: "go('overview')" } },
      { type: 'due', unread: true, time: '5h ago', title: 'Section due in 3 days',
        body: 'Statistical modelling · section 3 of 5 — finishing it unlocks the Python re-assessment.',
        action: { label: 'Resume section', onclick: "go('overview')" } },
      { type: 'assess', unread: true, time: 'Yesterday', title: 'Re-assessment ready for Python',
        body: 'Short adaptive form · 6 items · stops when the standard error drops below 0.30.',
        action: { label: 'Start re-assessment', onclick: "go('assessment')" } },
      { type: 'card', unread: false, time: '2 days ago', title: 'Report card preview updated',
        body: 'Draft verdict Partial — 2 of 5 skills met. Finalises when every skill is Met or the window closes.',
        action: { label: 'Open my reports', onclick: "go('reports')" } },
      { type: 'content', unread: false, time: '3 days ago', title: 'New content mapped to Python',
        body: 'Advanced pandas & performance · Coursera · 2h 45m was added to your plan.',
        action: { label: 'View content', onclick: "go('content')" } }
    ],
    manager: [
      { type: 'card', unread: true, time: '1h ago', title: 'Report card ready: Diya Banerjee',
        body: 'Fail · 2 of 6 skills met · Risk & Compliance. Decide between a remedial cycle and a development plan.',
        action: { label: 'Open team reports', onclick: "go('reports')" } },
      { type: 'risk', unread: true, time: '3h ago', title: 'Meera Iyer is behind',
        body: 'Timeline closes in 6 days with 3 sections still open and no re-assessment attempted.',
        action: { label: 'Nudge Meera', onclick: "nudge('Meera Iyer')" } },
      { type: 'reassess', unread: true, time: 'Yesterday', title: 'Re-assessment failed: Arjun Malhotra',
        body: 'Data modelling · remedial content was inserted automatically and the loop continues.',
        action: { label: 'Review Arjun', onclick: "openPerson('arjun')" } },
      { type: 'oneonone', unread: false, time: 'Yesterday', title: '1:1 confirmed with Rohan Kulkarni',
        body: 'Wed 28 May · 14:00 · development checkpoint.',
        action: { label: 'Open people', onclick: "go('people')" } },
      { type: 'team', unread: false, time: '2 days ago', title: 'Team outcome summary available',
        body: 'This cycle closed with 4 successes, 2 partial outcomes and 1 fail across your 7 reports.',
        action: { label: 'Open team report', onclick: "go('reports')" } }
    ],
    leader: [
      { type: 'publish', unread: true, time: '40m ago', title: 'Benchmark published',
        body: 'Data Analytics · Manager v3.2 assigned to 42 employees with a 90-day plan window.',
        action: { label: 'Open benchmark', onclick: "openCompetency('DA')" } },
      { type: 'validate', unread: true, time: '2h ago', title: 'Validation warnings on Data Analytics',
        body: '3 skills have a single mapped resource — SQL, Data visualization and Data storytelling.',
        action: { label: 'Run validation', onclick: "validateCompetency('DA')" } },
      { type: 'cohort', unread: true, time: '6h ago', title: '9 employees overdue across 4 competencies',
        body: 'Largest cohort: Managers · Data storytelling with 14 learners closing in 6 days.',
        action: { label: 'Review cohorts', onclick: "go('reports')" } },
      { type: 'card', unread: false, time: 'Yesterday', title: '6 report cards awaiting your review',
        body: 'Latest outcomes from closed Data Analytics plans, including 2 partial and 1 fail.',
        action: { label: 'Open reports', onclick: "go('reports')" } },
      { type: 'request', unread: false, time: '2 days ago', title: '2 skill requests pending curation',
        body: 'Prompt engineering and Vector search were requested for Emerging Technologies.',
        action: { label: 'Review requests', onclick: 'validateAllTaxonomy()' } }
    ],
    ld: [
      { type: 'broken', unread: true, time: '25m ago', title: '12 content issues detected',
        body: '5 broken links and 7 outdated resources across 6 competencies — nightly validation run.',
        action: { label: 'Open library', onclick: "go('content')" } },
      { type: 'mapped', unread: true, time: '1h ago', title: 'Content mapped outside the taxonomy',
        body: 'Prompt engineering for Analysts references a skill that is in no competency taxonomy.',
        action: { label: 'Run validation', onclick: 'validateAllTaxonomy()' } },
      { type: 'report', unread: true, time: '3h ago', title: 'Quarterly competency outcomes is ready',
        body: 'Generated for 12,480 closed plans · success 68% · partial 23% · fail 9%.',
        action: { label: 'Open reports', onclick: "go('reports')" } },
      { type: 'bottleneck', unread: false, time: 'Yesterday', title: 'Streaming architectures is a bottleneck',
        body: '41% of plans closed on expiry with only 2 mapped resources. Content commissioning recommended.',
        action: { label: 'View bottlenecks', onclick: "go('roadmap')" } },
      { type: 'schedule', unread: false, time: '2 days ago', title: 'Weekly programme digest sent',
        body: 'Delivered to 34 L&D recipients · opens 71% · click-through 38%.',
        action: { label: 'Open reports', onclick: "go('reports')" } }
    ]
  };

  function seedNotifications() {
    Object.keys(NOTIFICATION_SEED).forEach((k) => {
      state.notifs[k] = NOTIFICATION_SEED[k].map((n, i) => Object.assign({ id: k + '-' + i, read: !n.unread }, n));
    });
  }

  const personaNotifs = () => state.notifs[state.persona] || [];
  function unreadCount(p) { return (state.notifs[p || state.persona] || []).filter((n) => !n.read).length; }

  function updateNotifBadge() {
    const badge = $('#notifCount'), button = $('#notifButton');
    const n = unreadCount();
    if (badge) { badge.textContent = String(n); badge.classList.toggle('hidden', n === 0); }
    if (button && button.setAttribute) button.setAttribute('aria-label', 'Notifications · ' + n + ' unread');
  }

  const notifPanelOpen = () => !!($('#notifPanel') && $('#notifPanel').classList.contains('open'));

  function renderNotifPanel() {
    const panel = $('#notifPanel');
    if (!panel) return;
    const all = personaNotifs();
    const filter = state.notifFilter || 'all';
    const list = filter === 'unread' ? all.filter((n) => !n.read) : all;

    panel.innerHTML =
      '<div class="notif-head">' +
        '<h3>Notifications</h3>' +
        '<span class="tag teal">' + PERSONAS[state.persona].label + '</span>' +
        '<button class="text-button" onclick="markAllNotificationsRead()">Mark all read</button>' +
      '</div>' +
      '<div class="notif-tabs">' +
        '<button class="' + (filter === 'all' ? 'active' : '') + '" onclick="setNotifFilter(\'all\')">All · ' + all.length + '</button>' +
        '<button class="' + (filter === 'unread' ? 'active' : '') + '" onclick="setNotifFilter(\'unread\')">Unread · ' + unreadCount() + '</button>' +
      '</div>' +
      '<div class="notif-list">' + (list.length ? list.map((n) =>
        '<div class="notif-item ' + (n.read ? '' : 'unread') + '" onclick="openNotification(\'' + n.id + '\')">' +
          '<div class="notif-icon ' + (NOTIF_TONE[n.type] || '') + '">' + icon(NOTIF_ICON[n.type] || 'bell', 15) + '</div>' +
          '<div class="notif-body"><strong>' + esc(n.title) + '</strong><p>' + esc(n.body) + '</p>' +
            '<div class="notif-meta"><span>' + esc(n.time) + '</span>' +
            (n.action ? '<button class="text-button" onclick="event.stopPropagation();openNotification(\'' + n.id + '\',true)">' +
              esc(n.action.label) + ' ' + icon('arrow', 12) + '</button>' : '') +
            '</div></div>' +
          '<span class="notif-dot"></span>' +
        '</div>').join('')
        : '<div class="notif-empty"><span>' + icon('check', 16) + '</span>You’re all caught up.</div>') +
      '</div>' +
      '<div class="notif-foot"><span>Delivered by email · in-app · Teams</span>' +
      '<button class="text-button" onclick="toast(\'Notification settings\',\'Choose which lifecycle events reach email, Teams and the in-app inbox.\')">Settings</button></div>';
  }

  window.setNotifFilter = function (f) { state.notifFilter = f; renderNotifPanel(); };

  window.toggleNotifications = function () {
    const panel = $('#notifPanel'), button = $('#notifButton');
    if (!panel) return;
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    if (panel.setAttribute) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (button && button.setAttribute) button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) renderNotifPanel();
  };
  window.closeNotifications = function () {
    const panel = $('#notifPanel');
    if (!panel) return;
    panel.classList.remove('open');
    if (panel.setAttribute) panel.setAttribute('aria-hidden', 'true');
  };

  window.openNotification = function (id, runAction) {
    const n = personaNotifs().filter((x) => x.id === id)[0];
    if (!n) return;
    n.read = true;
    updateNotifBadge();
    renderNotifPanel();
    if (runAction && n.action) {
      try { (new Function(n.action.onclick))(); }
      catch (e) { toast('Action unavailable', e.message); }
      window.closeNotifications();
    }
  };

  window.markAllNotificationsRead = function () {
    const list = personaNotifs();
    const unread = list.filter((n) => !n.read).length;
    list.forEach((n) => { n.read = true; });
    updateNotifBadge();
    renderNotifPanel();
    refreshPersonaDots();
    toast(unread ? 'Inbox cleared' : 'Nothing to clear',
      unread ? unread + ' notification(s) marked as read for ' + PERSONAS[state.persona].label + '.'
             : 'You have no unread notifications.');
  };

  /* other parts of the demo push events into the right inbox */
  function pushNotification(persona, n) {
    if (!state.notifs[persona]) state.notifs[persona] = [];
    state.notifSeq += 1;
    state.notifs[persona].unshift(Object.assign({
      id: persona + '-e' + state.notifSeq, read: false, time: 'just now'
    }, n));
    if (persona === state.persona) {
      updateNotifBadge();
      if (notifPanelOpen()) renderNotifPanel();
    }
    refreshPersonaDots();
  }

  function refreshPersonaDots() { personaSwitcher(); }

  /* ---------------------------------------------------------------- parts */
  function personaSwitcher() {
    $('#personaSwitcher').innerHTML = Object.keys(PERSONAS).map((k) => {
      const p = PERSONAS[k];
      const unread = unreadCount(k);
      return '<button role="tab" aria-selected="' + (state.persona === k) + '" class="' + (state.persona === k ? 'active' : '') +
        '" data-persona="' + k + '" title="' + unread + ' unread notification(s)">' +
        '<span>' + p.initials + '</span>' + p.label +
        (unread ? '<em class="pd-dot" aria-label="' + unread + ' unread"></em>' : '') + '</button>';
    }).join('');
    $$('#personaSwitcher button').forEach((b) => b.addEventListener('click', () => setPersona(b.dataset.persona)));
  }

  /* views that change with the persona, not just the overview */
  const PERSONA_SCOPED = ['overview', 'reports'];
  const REPORT_NAV = {
    candidate: { label: 'My reports', badge: 'me' },
    manager: { label: 'Team reports', badge: '7' },
    leader: { label: 'Competency reports', badge: '412' },
    ld: { label: 'Programme reports', badge: '12.5k' }
  };

  function updateReportsNav() {
    const nav = REPORT_NAV[state.persona] || REPORT_NAV.candidate;
    const label = $('#navReportsLabel'), badge = $('#navReportsBadge');
    if (label) label.textContent = nav.label;
    if (badge) badge.textContent = nav.badge;
  }

  function setPersona(k) {
    state.persona = k;
    personaSwitcher();
    updateReportsNav();
    updateNotifBadge();
    renderNotifPanel();
    renderOverview();
    if (state.view === 'reports') renderReports();
    if (state.view !== 'overview' && PERSONA_SCOPED.indexOf(state.view) === -1) {
      toast('Persona switched', PERSONAS[k].label + ' — Overview, Reports and the inbox now follow this persona.');
    }
  }

  function journeyStrip(title, steps) {
    return '<div class="journey"><div class="journey-title"><span>Journey</span><strong>' + title + '</strong></div>' +
      '<div class="journey-steps">' + steps.map(([name, sub, st], i) =>
        '<div class="journey-step ' + st + '">' +
          '<div class="step-marker">' + (st === 'complete' ? icon('check', 13) : (i + 1)) + '</div>' +
          '<div><strong>' + name + '</strong><span>' + sub + '</span></div>' +
          '<i></i>' +
        '</div>').join('') + '</div></div>';
  }

  function metricCard(m) {
    const cls = 'metric-card' + (m.variant ? ' ' + m.variant : '');
    return '<article class="' + cls + '">' +
      '<div class="metric-top"><span>' + m.label + '</span>' +
        '<div class="metric-icon ' + (m.iconTone || '') + '">' + icon(m.icon, 16) + '</div></div>' +
      '<div class="metric-value' + (m.compact ? ' compact-value' : '') + '">' + m.value + (m.unit ? '<span>' + m.unit + '</span>' : '') + '</div>' +
      (m.meta ? '<div class="metric-meta">' + m.meta + '</div>' : '') +
      (m.progress !== undefined ? '<div class="progress-track ' + (m.variant === 'featured' ? 'light' : (m.bar || '')) + '"><span style="width:' + m.progress + '%"></span></div>' : '') +
      (m.action ? '<button class="text-button" onclick="' + m.action.onclick + '">' + m.action.label + ' ' + icon('arrow', 13) + '</button>' : '') +
      '</article>';
  }

  function panel(title, sub, bodyHtml, opts) {
    const o = opts || {};
    return '<div class="panel">' +
      '<div class="panel-header"><div><h2>' + title + '</h2><p>' + sub + '</p></div>' +
      (o.toolbar || '') + '</div>' + bodyHtml + '</div>';
  }

  function barRows(rows, unit, tone) {
    return rows.map(([label, value, display]) =>
      '<div class="hbar-row"><span>' + label + '</span>' +
      '<div class="hbar-track"><div class="hbar-fill" style="width:' + value + '%' + (tone ? ';background:' + tone : '') + '"></div></div>' +
      '<span class="val">' + (display || value + (unit || '%')) + '</span></div>').join('');
  }

  function sparkline(values) {
    const w = 500, h = 132, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    const pts = values.map((v, i) => [i * (w / (values.length - 1)), h - ((v - min) / ((max - min) || 1)) * (h - 22) - 10]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area = line + ' L' + w + ',' + h + ' L0,' + h + ' Z';
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="Learning completions trend">' +
      '<path d="' + area + '" fill="none" style="fill:#eef7f4"/>' +
      '<path d="' + line + '" fill="none" stroke="#147e6f" stroke-width="2.4" stroke-linecap="round"/>' +
      points(pts) + '</svg>';
  }
  function points(pts) {
    return pts.filter((_, i) => i % 2 === 0).map((p) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4" fill="#fff" stroke="#147e6f" stroke-width="2.2"/>').join('');
  }

  function skillLevels(person) {
    const names = SKILL_SETS[person.comp];
    const p = person.progress / 100;
    return names.map((n, i) => {
      const target = i < 2 ? 3 : (i < 4 ? 2 : 3);
      const lv = p >= 0.9 ? (i < 3 ? 4 : 3) : p >= 0.7 ? (i < 2 ? 3 : 2) : p >= 0.5 ? (i < 1 ? 3 : 2) : p >= 0.35 ? (i < 1 ? 2 : 1) : 1;
      return { name: n, target: target, level: lv, met: lv >= target };
    });
  }

  /* ------------------------------------------------------------ overview */
  function renderOverview() {
    const p = PERSONAS[state.persona];
    $('#pageEyebrow').textContent = p.eyebrow;
    $('#pageTitle').textContent = p.greeting;
    $('#pageLede').textContent = p.lede;
    $('#pageActions').innerHTML = '<button class="button" onclick="toast(\'Notifications\',\'' + p.label + ': 3 new notifications.\')">' + icon('bell', 15) + ' Notifications</button>' +
      '<button class="button button-primary" onclick="overviewAction()">' + icon('spark', 15) + ' ' + p.action + '</button>';
    $('#overviewBody').innerHTML =
      journeyStrip(p.journeyTitle, p.journey) +
      ({ leader: overviewLeader, candidate: overviewCandidate, manager: overviewManager, ld: overviewLD }[state.persona])();
    wireOverview();
  }

  window.overviewAction = function () {
    const a = { leader: 'Create benchmark', candidate: 'Continue learning', manager: 'Schedule 1:1', ld: 'Map content' }[state.persona];
    if (state.persona === 'candidate') { go('assessment'); return; }
    if (state.persona === 'ld') { go('content'); return; }
    if (state.persona === 'leader') { go('competencies'); return; }
    toast(a, 'Opening the next step in the ' + PERSONAS[state.persona].label + ' journey.');
  };

  /* --- candidate ---------------------------------------------------------- */
  function overviewCandidate() {
    const done = state.plan.filter((x) => x.state === 'done').length;
    const pct = Math.round((done / state.plan.length) * 100);
    const metrics =
      metricCard({ label: 'Plan progress', icon: 'target', value: pct, unit: '%', variant: 'featured', progress: pct,
        meta: '<strong>' + state.plan.length + ' sections</strong><span>' + done + ' complete</span>' }) +
      metricCard({ label: 'Skills met', icon: 'check', iconTone: 'neutral', value: '2', unit: '/ 5', bar: 'coral', progress: 40,
        meta: '<span class="positive">+1</span><span>in the last 30 days</span>' }) +
      metricCard({ label: 'Learning time', icon: 'clock', iconTone: 'neutral', value: '7h 45m',
        meta: '<span>across 3 providers</span>' }) +
      metricCard({ label: 'Next checkpoint', icon: 'book', iconTone: 'warm', value: 'Python', compact: true,
        meta: '<span>Re-assessment after section 3</span>',
        action: { label: 'View details', onclick: "go('assessment')" } });

    const planRows = state.plan.map((s, i) =>
      '<div class="plan-row ' + s.state + '">' +
        '<div class="plan-number">' + (s.state === 'done' ? icon('check', 13) : (i + 1)) + '</div>' +
        '<div><strong>' + s.title + '</strong><span>' + s.source + '</span></div>' +
        '<em>' + (s.state === 'done' ? 'Done' : s.state === 'active' ? 'In progress' : 'Upcoming') + '</em>' +
        (s.state === 'done' ? '' : '<button onclick="resumePlan(' + i + ')"' + (s.state === 'locked' ? ' disabled style="background:#cfd8d4"' : '') + '>' +
          (s.state === 'active' ? 'Resume ' : 'Start ') + icon('arrow', 12) + '</button>') +
      '</div>').join('');

    const skills = CAND_SKILLS.map((s) =>
      '<div class="content-row"><div><strong>' + s.name + '</strong><span>Target ' + s.target + (s.assessed ? ' · assessed ' + s.assessed : ' · not assessed') + '</span></div>' +
      '<span>' + (s.assessed || '—') + '</span>' +
      '<div class="row-progress"><div class="progress-track"><span style="width:' + (s.status === 'Met' ? 100 : s.status === 'Learning' ? 55 : 0) + '%"></span></div></div>' +
      '<span class="status ' + (s.status === 'Met' ? 'on-track' : s.status === 'Learning' ? 'behind' : 'completed') + '">' + s.status + '</span>' +
      '<span></span></div>').join('');

    return '<div class="metric-grid">' + metrics + '</div>' +
      '<div class="dashboard-grid">' +
        panel('Your learning plan', 'Data Analytics · Senior Associate · Benchmark v3.2', '<div class="row-list">' + planRows + '</div>',
          { toolbar: '<span class="tag teal">' + done + ' of ' + state.plan.length + ' complete</span>' }) +
        '<div class="panel"><div class="assessment-hero">' + icon('spark', 22) +
          '<span>Up next</span><h2>Adaptive re-assessment</h2>' +
          '<p>The question difficulty adapts as you answer. Most candidates finish in 6 items; the engine stops early once the standard error target is met.</p></div>' +
          '<div class="assessment-facts"><div><span>Max items</span><strong>8</strong></div><div><span>SE target</span><strong>0.30</strong></div><div><span>Est. time</span><strong>6 min</strong></div></div>' +
          '<div class="panel-body" style="padding-top:0"><button class="button button-teal full-button" onclick="go(\'assessment\')">' + icon('play', 14) + ' Start adaptive re-assessment</button>' +
          '<div style="margin-top:11px;text-align:center"><button class="text-button" onclick="go(\'assessment\')">View assessment details ' + icon('arrow', 13) + '</button></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="dashboard-grid">' +
        panel('My skills', 'Benchmark targets and current assessed level', '<div class="row-list">' +
          '<div class="content-head"><span>Skill</span><span>Assessed</span><span>Progress</span><span>Status</span><span></span></div>' + skills + '</div>') +
        panel('Upcoming', 'Next actions from your plan', '<div class="row-list">' +
          [['Re-assessment · Python', 'Unlocks when section 3 is marked complete', 'After section 3'],
           ['Quarterly check-in with Vikram Shah', 'Scheduled 1:1 · 30 minutes', '28 May'],
           ['Report card generation', 'Fires when all skills are Met or the window closes', '18 Aug']]
            .map(([t, s, w]) => '<div class="report-row">' + '<div class="report-icon">' + icon('calendar', 15) + '</div>' +
              '<div><strong>' + t + '</strong><span>' + s + '</span></div><span class="tag">' + w + '</span></div>').join('') + '</div>') +
      '</div>';
  }

  window.resumePlan = function (i) {
    const s = state.plan[i];
    if (s.state === 'done') return;
    s.state = 'done';
    const next = state.plan.find((x) => x.state === 'locked');
    if (next) next.state = 'active';
    renderOverview();
    toast('Resuming ' + s.title, 'plan.item.completed emitted · re-assessment unlocked for this skill');
  };

  /* --- manager ------------------------------------------------------------ */
  function overviewManager() {
    const team = PEOPLE.filter((x) => ['aarav', 'meera', 'arjun', 'rohan', 'neha', 'kavya', 'sanjay'].indexOf(x.id) !== -1);
    const metrics =
      metricCard({ label: 'On track', icon: 'target', value: '8', variant: 'featured', progress: 67,
        meta: '<strong>67% of team</strong><span>12 direct reports</span>' }) +
      metricCard({ label: 'Behind', icon: 'clock', iconTone: 'warm', value: '2', bar: 'coral', progress: 17,
        meta: '<span class="negative">Need intervention</span><span>both Data Analytics</span>' }) +
      metricCard({ label: 'Completed', icon: 'check', iconTone: 'neutral', value: '1',
        meta: '<strong>Kavya Nair</strong><span>closed 20 May</span>' }) +
      metricCard({ label: 'Avg. proficiency', icon: 'trend', iconTone: 'neutral', value: '71', unit: '%', progress: 71,
        meta: '<span class="positive">+6%</span><span>this quarter</span>' });

    const teamRows = team.map((m) =>
      '<div class="team-row">' +
        '<div class="avatar ' + m.tint + '">' + m.initials + '</div>' +
        '<div class="person-cell"><div><strong>' + m.name + '</strong><em>' + m.role + ' · ' + m.comp + '</em></div></div>' +
        '<div class="row-progress"><div class="progress-track ' + (m.status === 'Behind' ? 'coral' : '') + '"><span style="width:' + m.progress + '%"></span></div><strong>' + m.progress + '%</strong></div>' +
        '<span class="due' + (m.urgent ? ' urgent' : '') + '">' + m.due + '</span>' +
        '<button class="nudge-button" onclick="nudge(\'' + m.name + '\')">Nudge</button>' +
      '</div>').join('');

    const focus =
      '<div class="focus-card urgent-card">' + icon('clock', 16) +
        '<div><strong>Check in with Meera Iyer</strong><p>Timeline closes in 6 days with 3 sections still open. Re-assessment not yet attempted.</p>' +
        '<button onclick="toast(\'1:1 scheduled\',\'A 30-minute check-in with Meera Iyer was proposed.\')">Schedule 1:1 →</button></div></div>' +
      '<div class="focus-card urgent-card">' + icon('alert', 16) +
        '<div><strong>Arjun Malhotra is at risk</strong><p>4 days remaining, one re-assessment already failed on Data modelling.</p>' +
        '<button onclick="nudge(\'Arjun Malhotra\')">Send nudge →</button></div></div>' +
      '<div class="focus-card">' + icon('spark', 16) +
        '<div><strong>Recognize Kavya Nair</strong><p>Closed all 6 skills ahead of the window — 8 of 8 targets met at Advanced.</p>' +
        '<button onclick="toast(\'Recognition sent\',\'A note was shared with Kavya Nair and the competency leader.\')">Send recognition →</button></div></div>' +
      '<div class="focus-card">' + icon('trend', 16) +
        '<div><strong>Team insight</strong><p>Statistical analysis is the team bottleneck: 3 of 7 reports have not reached target.</p>' +
        '<button onclick="go(\'reports\')">View report →</button></div></div>';

    const gaps = [];
    const counts = {};
    team.forEach((m) => skillLevels(m).forEach((s) => { if (!s.met) counts[s.name] = (counts[s.name] || 0) + 1; }));
    Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach((k) => gaps.push([k, Math.round((counts[k] / team.length) * 100), counts[k] + ' reports']));

    return '<div class="metric-grid">' + metrics + '</div>' +
      '<div class="dashboard-grid wide-left">' +
        panel('Team progress', 'Prioritized by attention needed', '<div class="row-list">' + teamRows + '</div>',
          { toolbar: '<button class="text-button" onclick="go(\'people\')">View all people ' + icon('arrow', 13) + '</button>' }) +
        panel('Recommended actions', 'Generated from timeline risk and re-assessment history', focus) +
      '</div>' +
      '<div class="dashboard-grid">' +
        panel('Team skill gaps', 'Share of reports not yet at target proficiency', '<div class="panel-body pad-top">' + barRows(gaps, '', 'linear-gradient(90deg,#e8785d,#d4553f)') + '</div>') +
        panel('Upcoming 1:1s', 'Development check-ins scheduled this fortnight', '<div class="row-list">' +
          [['Meera Iyer', 'Tue 27 May · 10:30', 'Timeline risk'], ['Rohan Kulkarni', 'Wed 28 May · 14:00', 'Checkpoint'],
           ['Neha Joshi', 'Thu 29 May · 09:00', 'Final review'], ['Ishaan Verma', 'Fri 30 May · 11:15', 'Checkpoint']]
            .map(([n, w, t]) => '<div class="report-row"><div class="report-icon">' + icon('calendar', 15) + '</div>' +
              '<div><strong>' + n + '</strong><span>' + w + '</span></div><span class="tag">' + t + '</span></div>').join('') + '</div>') +
      '</div>';
  }

  window.nudge = function (name) {
    toast('Nudged ' + name, 'Email + Teams nudge delivered with their next plan section and due date.');
    const person = PEOPLE.filter((x) => x.name === name)[0];
    if (person && person.id === 'aarav') {
      pushNotification('candidate', {
        type: 'nudge', title: 'Vikram Shah nudged you',
        body: 'Reminder about ' + person.focus + ' — ' + person.due + ' left in your plan window.',
        action: { label: 'Open my plan', onclick: "go('overview')" }
      });
    }
  };

  /* --- leader ------------------------------------------------------------- */
  function overviewLeader() {
    const metrics =
      metricCard({ label: 'Overall proficiency', icon: 'target', value: '63', unit: '%', variant: 'featured', progress: 63,
        meta: '<strong>63% of all targeted skills</strong><span>Data Analytics</span>' }) +
      metricCard({ label: 'Active learners', icon: 'users', iconTone: 'neutral', value: '184', progress: 74,
        meta: '<span class="positive">+12</span><span>this month · 74% of assigned people</span>' }) +
      metricCard({ label: 'Skills met', icon: 'check', iconTone: 'neutral', value: '1,286', bar: 'coral', progress: 63,
        meta: '<span class="positive">+96</span><span>in the last 30 days</span>' }) +
      metricCard({ label: 'Need attention', icon: 'clock', iconTone: 'warm', value: '9', variant: 'attention',
        meta: '<strong>9 overdue</strong><span>across 4 competencies</span>',
        action: { label: 'Review learners', onclick: "go('people')" } });

    const heat = BENCHMARK.map((row) =>
      '<div class="heatmap-row"><strong>' + row.skill + '</strong>' +
        row.targets.map((t) => '<div class="heat-cell" style="background:' + heatColor(t) + '" title="' + level(t) + '">' + level(t).charAt(0) + '</div>').join('') +
      '</div>').join('');

    const heatmap = '<div class="heatmap-scroll"><div class="heatmap">' +
      '<div class="heatmap-head"><span>Skill</span>' + ROLES.map((r) => '<span>' + r + '</span>').join('') + '</div>' +
      heat + '</div></div>' +
      '<div class="heatmap-footer"><div class="legend"><span>Lower</span>' +
        [1, 2, 3, 4].map((i) => '<i style="background:' + heatColor(i) + '"></i>').join('') + '<span>Higher</span></div>' +
        '<button class="text-button" onclick="go(\'competencies\')">Open benchmark ' + icon('arrow', 13) + '</button></div>';

    const momentum = values();
    const chart = '<div class="chart-total"><strong>1,284</strong><span>sections completed</span><em>+18% QoQ</em></div>' +
      '<div class="line-chart"><div class="chart-lines"><i></i><i></i><i></i><i></i></div>' + sparkline(momentum.values) +
      '<div class="chart-labels">' + momentum.labels.map((l) => '<span>' + l + '</span>').join('') + '</div></div>' +
      '<div class="insight">' + icon('spark', 15) + '<p><strong>Momentum is compounding.</strong> Completions rose 18% quarter on quarter, led by Python and SQL after the v3.2 benchmark publish.</p></div>';

    const watch = PEOPLE.filter((m) => m.status !== 'Completed').slice(0, 6);
    const watchRows = '<div class="data-row head" style="grid-template-columns:1.6fr .8fr 1fr 1fr .7fr">' +
        '<span>Person</span><span>Status</span><span>Progress</span><span>Current focus</span><span>Timeline</span></div>' +
      watch.map((m) => '<div class="data-row" style="grid-template-columns:1.6fr .8fr 1fr 1fr .7fr;cursor:pointer" onclick="openPerson(\'' + m.id + '\')">' +
        '<div class="person-cell"><div class="avatar ' + m.tint + '">' + m.initials + '</div><div><strong>' + m.name + '</strong><em>' + m.role + '</em></div></div>' +
        '<span class="status ' + statusClass(m.status) + '">' + m.status + '</span>' +
        '<div class="row-progress"><div class="progress-track ' + (m.status === 'Behind' ? 'coral' : '') + '"><span style="width:' + m.progress + '%"></span></div><strong>' + m.progress + '%</strong></div>' +
        '<span style="font-size:11px;color:var(--muted)">' + m.focus + '</span>' +
        '<span class="due' + (m.urgent ? ' urgent' : '') + '">' + m.due + '</span></div>').join('');

    return '<div class="metric-grid">' + metrics + '</div>' +
      '<div class="dashboard-grid wide-left">' +
        panel('Competency heatmap', 'Required proficiency by skill and role level — Data Analytics v3.2', heatmap) +
        panel('Learning momentum', 'Sections completed per week', chart) +
      '</div>' + panel('People to watch', 'Filtered to learners needing attention this cycle', '<div class="row-list">' + watchRows + '</div>');
  }
  function heatColor(t) { return ['#dcefe9', '#8fc4b6', '#2f9c88', '#147e6f'][t - 1]; }
  function values() {
    return { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      values: [62, 71, 68, 84, 79, 96, 91, 108, 117, 112, 131, 142] };
  }

  /* --- L&D ---------------------------------------------------------------- */
  function overviewLD() {
    const metrics =
      metricCard({ label: 'Active programs', icon: 'layers', value: '6', variant: 'featured', progress: 100,
        meta: '<strong>6 competencies</strong><span>12 benchmark versions live</span>', bar: 'light' }) +
      metricCard({ label: 'Completion rate', icon: 'check', iconTone: 'neutral', value: '71', unit: '%', progress: 71,
        meta: '<span class="positive">+4.2%</span><span>this quarter</span>' }) +
      metricCard({ label: 'First-time pass', icon: 'target', iconTone: 'neutral', value: '83', unit: '%',
        meta: '<span>across 2,146 attempts</span>' }) +
      metricCard({ label: 'Content issues', icon: 'clock', iconTone: 'warm', value: '12', variant: 'attention',
        meta: '<strong>5 broken · 7 outdated</strong><span>needs remediation</span>',
        action: { label: 'Review queue', onclick: "go('content')" } });

    const health = CONTENT.filter((c) => c.health !== 'Healthy').map((c) =>
      '<div class="content-row">' +
        '<div><strong>' + c.title + '</strong><span>' + c.skill + ' · ' + c.provider + '</span></div>' +
        '<span>' + c.type + '</span><span>' + c.level + '</span><span>' + c.validated + '</span>' +
        '<span class="status ' + healthClass(c.health) + '">' + c.health + '</span>' +
      '</div>').join('');

    const providers = [['Internal academy / LMS', 54], ['Coursera', 18], ['LinkedIn Learning', 12], ['Microsoft Learn', 9], ['Other public', 7]];

    return '<div class="metric-grid">' + metrics + '</div>' +
      '<div class="dashboard-grid wide-left">' +
        panel('Content health', 'Resources needing validation or remediation', '<div class="row-list">' +
          '<div class="content-head"><span>Resource</span><span>Type</span><span>Level</span><span>Last checked</span><span>State</span></div>' + health + '</div>',
          { toolbar: '<button class="text-button" onclick="go(\'content\')">Open library ' + icon('arrow', 13) + '</button>' }) +
        panel('Bottleneck skills', 'Share still not Met at timeline expiry', '<div class="row-list">' +
          BOTTLENECK.map(([name, pct, learners], i) =>
            '<div class="bottleneck-row"><span class="rank">' + (i + 1) + '</span>' +
            '<div><strong>' + name + '</strong><span class="learners">' + learners.toLocaleString('en-GB') + ' learners</span>' +
            '<div class="progress-track"><i style="width:' + pct + '%"></i></div></div>' +
            '<em>' + pct + '%</em></div>').join('') + '</div>') +
      '</div>' +
      '<div class="dashboard-grid">' +
        panel('Provider mix', 'Share of assigned learning items by source', '<div class="panel-body pad-top">' + barRows(providers, '') + '</div>') +
        panel('Link validation queue', 'Automated checks run nightly', '<div class="row-list">' +
          [['Broken links', '5 resources return 404', 'Failed'], ['Outdated content', '7 resources older than 18 months', 'Behind'],
           ['Unmapped content', '23 resources not mapped to a skill', 'Behind'], ['Validated this month', '363 resources healthy', 'Completed']]
            .map(([t, s, st]) => '<div class="report-row"><div class="report-icon">' + icon('file', 15) + '</div>' +
              '<div><strong>' + t + '</strong><span>' + s + '</span></div><span class="status ' + statusClass(st) + '">' + (st === 'Completed' ? 'Healthy' : st === 'Behind' ? 'Review' : 'Broken') + '</span></div>').join('') + '</div>') +
      '</div>';
  }

  function wireOverview() {
    $$('#overviewBody .journey-step').forEach(() => {});
  }

  /* ---------------------------------------------------- competencies view */
  function renderCompetencies() {
    const total = COMPETENCIES.length;
    const active = COMPETENCIES.filter((c) => c.status === 'Published').length;
    const drafts = total - active;
    const assigned = COMPETENCIES.reduce((s, c) => s + c.assigned, 0);
    const review = COMPETENCIES.filter((c) => c.status === 'Review').length;
    const published = state.publishLog.length;
    $('#compSummary').innerHTML =
      summaryCard('layers', 'Competencies', total, active + ' active · ' + drafts + ' in draft/review') +
      summaryCard('target', 'Published benchmarks', active, published ? published + ' published this session' : 'Across 5 role levels') +
      summaryCard('clock', 'Awaiting validation', review + SKILL_REQUESTS.length,
        SKILL_REQUESTS.length + ' skill requests · ' + review + ' version(s) in review', 'warm');

    const f = $('#compStatusFilter').value;
    const q = state.query.toLowerCase();
    const rows = COMPETENCIES.filter((c) => (f === 'all' || c.status === f) && (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)));
    $('#navCompCount').textContent = total;

    $('#compTable').innerHTML =
      '<div class="module-row module-head"><span>Competency</span><span>Structure</span><span>Version</span><span>Status</span><span>Assigned</span><span></span></div>' +
      (rows.length ? rows.map((c) =>
        '<div class="module-row" style="cursor:pointer" onclick="openCompetency(\'' + c.code + '\')">' +
          '<div class="module-name"><i>' + c.code + '</i><div><strong>' + c.name +
            (c.justPublished ? ' <span class="tag new">New</span>' : '') + '</strong>' +
            '<span>Owner ' + c.owner + ' · updated ' + c.updated + '</span></div></div>' +
          '<div class="cell-stack"><strong>' + c.skills + ' skills</strong><span>' + c.roles + ' roles</span></div>' +
          '<div class="cell-stack"><strong>' + c.version + '</strong><span>' + c.inDraft + ' in draft</span></div>' +
          '<span class="status ' + (c.status === 'Published' ? 'published' : c.status === 'Draft' ? 'draft' : 'review') + '">' + c.status + '</span>' +
          '<div class="cell-stack"><strong>' + c.assigned + '</strong><span>employees</span></div>' +
          '<button class="icon-button compact" onclick="event.stopPropagation();openCompetency(\'' + c.code + '\')">' + icon('chevron', 15) + '</button>' +
        '</div>').join('')
        : '<div class="empty-state">No competencies match “' + esc(state.query) + '”.</div>');
  }

  function summaryCard(ico, label, value, small, tone) {
    return '<article><div class="metric-icon ' + (tone || 'neutral') + '">' + icon(ico, 16) + '</div>' +
      '<div><span>' + label + '</span><strong>' + value + '</strong><small>' + small + '</small></div></article>';
  }

  window.openCompetency = function (code) {
    const c = COMPETENCIES.filter((x) => x.code === code)[0];
    if (!c) return;
    const rows = benchmarkFor(c.name);
    const matrix = rows.map((row) =>
      '<div class="fact-row" style="align-items:flex-start"><span style="width:150px;flex:none">' + row.skill + '<br><em style="font-style:normal;font-size:10px;color:var(--muted-2)">' + row.type + '</em></span>' +
      '<div style="display:flex;gap:6px;flex:1">' + ROLES.map((r, i) =>
        '<div style="flex:1;text-align:center"><select class="matrix-select" data-skill="' + row.skill + '" data-comp="' + c.code + '" data-role="' + r + '" style="width:100%;font:inherit;font-size:11px;padding:5px 4px;border:1px solid var(--line);border-radius:7px;background:#fff">' +
        LEVELS.map((l, li) => '<option value="' + (li + 1) + '"' + (row.targets[i] === li + 1 ? ' selected' : '') + '>' + l.charAt(0) + '</option>').join('') +
        '</select></div>').join('') + '</div></div>').join('');

    const history = versionHistory(c).map(([v, d, n, st]) =>
      '<div class="fact-row"><span><strong style="color:var(--ink)">' + v + '</strong> · ' + d + '</span>' +
      '<span><span class="tag' + (st === 'Current' ? ' teal' : '') + '">' + n + ' employees</span></span></div>').join('');

    openDrawer('Benchmark matrix', c.name + ' · ' + c.version + ' · ' + c.status,
      '<div class="panel" style="box-shadow:none"><div class="panel-header"><div><h2>Target proficiency by role</h2>' +
      '<p>B = Beginner · I = Intermediate · A = Advanced · E = Expert</p></div><span class="tag ' + (c.status === 'Published' ? 'teal' : 'amber') + '">' + c.status + '</span></div>' +
      '<div class="panel-body">' + matrix + '</div>' +
      '<div class="panel-footer"><button class="button button-sm" onclick="validateCompetency(\'' + c.code + '\')">' + icon('check', 14) + ' Validate taxonomy</button>' +
      '<button class="button button-primary button-sm" onclick="publishBenchmark(\'' + c.name + '\')">Publish &amp; assign</button></div></div>' +
      '<div class="panel" style="box-shadow:none;margin-top:14px"><div class="panel-header"><div><h2>Version history</h2><p>Effective dates and assignment volume</p></div></div>' +
      '<div class="panel-body pad-top">' + history + '</div></div>' +
      '<div class="insight" style="margin:14px 0 0">' + icon('spark', 16) + '<p>Editing targets creates a new version. In-flight plans stay on the version they were assigned unless you explicitly re-assign.</p></div>');
  };

  /* ======================================================================
     BENCHMARK CREATION + TAXONOMY VALIDATION
     ====================================================================== */

  /* taxonomy: the curated set of skills a competency may reference */
  const TAXONOMY = {
    'Data Analytics': ['Python', 'SQL', 'Data visualization', 'Statistical analysis', 'Data storytelling',
      'Data modelling', 'Data governance', 'Experimentation', 'Feature engineering', 'Causal inference'],
    'Cloud Engineering': ['Cloud analytics', 'Terraform', 'SQL', 'Data modelling', 'Security fundamentals',
      'Container orchestration', 'Cost optimisation', 'Observability'],
    'Product Management': ['Roadmapping', 'Stakeholder management', 'Data storytelling', 'Discovery practice',
      'Metrics design', 'Pricing strategy', 'Experiment design'],
    'Digital Strategy': ['Data visualization', 'Business case modelling', 'Market analysis', 'Change management',
      'Storytelling', 'Operating model design'],
    'Risk & Compliance': ['Statistical analysis', 'Controls design', 'Regulatory reporting', 'Audit readiness',
      'Data governance', 'Third-party risk'],
    'Emerging Technologies': ['Python', 'Streaming architectures', 'MLOps', 'Cloud analytics', 'Agent orchestration']
  };
  const SKILL_REQUESTS = [
    { skill: 'Prompt engineering', competency: 'Emerging Technologies', by: 'Priya Deshmukh', on: '21 May 2025' },
    { skill: 'Vector search', competency: 'Emerging Technologies', by: 'Priya Deshmukh', on: '21 May 2025' },
    { skill: 'Real-time feature stores', competency: 'Data Analytics', by: 'Ananya Rao', on: '19 May 2025' }
  ];
  const ROLE_AUDIENCE = { 'Associate': 84, 'Sr. Associate': 96, 'Manager': 42, 'Sr. Manager': 18, 'Director': 8 };
  const BASE_TARGETS = [2, 3, 3, 4, 4];
  const HIST_DATES = ['14 Feb 2025', '02 Sep 2024'];

  const taxonomySkills = (comp) => TAXONOMY[comp] || [];
  const contentFor = (skill) => CONTENT.filter((c) => c.skill === skill);
  const checkCount = (checks, lvl) => checks.filter((c) => c.level === lvl).length;

  /* the published matrix for a competency (Data Analytics uses the real one) */
  function benchmarkFor(comp) {
    if (comp === 'Data Analytics') return BENCHMARK.map((r) => ({ skill: r.skill, type: r.type, targets: r.targets.slice() }));
    return taxonomySkills(comp).slice(0, 5).map((s, i) => {
      const shift = i < 2 ? 0 : (i < 4 ? -1 : 0);
      return {
        skill: s, type: i === 4 ? 'Business' : 'Technical',
        targets: BASE_TARGETS.map((t) => Math.max(1, Math.min(4, t + shift)))
      };
    });
  }

  function versionHistory(c) {
    if (!state.versions[c.code]) {
      const m = /v(\d+)\.(\d+)/.exec(c.version) || [0, '1', '0'];
      const major = Number(m[1]), minor = Number(m[2]);
      const rows = [[c.version, 'Published ' + c.updated, c.assigned || 0, 'Current']];
      for (let k = 1; k <= 2; k++) {
        const mm = minor - k;
        rows.push([
          'v' + (mm < 0 ? major - 1 : major) + '.' + (mm < 0 ? 9 : mm),
          'Published ' + HIST_DATES[k - 1],
          Math.max(0, (c.assigned || 0) - k * 9),
          'Superseded'
        ]);
      }
      state.versions[c.code] = rows;
    }
    return state.versions[c.code];
  }

  const nextVersion = (v) => {
    const m = /v(\d+)\.(\d+)/.exec(v) || [0, '1', '0'];
    return 'v' + m[1] + '.' + (Number(m[2]) + 1);
  };

  /* ---- the validation engine -------------------------------------------- */
  function runChecks(comp, skills, opts) {
    const o = opts || {};
    const tax = taxonomySkills(comp);
    const published = o.published || benchmarkFor(comp);
    const checks = [];

    /* 1 — every skill resolves against the taxonomy */
    const unknown = skills.filter((s) => tax.indexOf(s.name) === -1);
    checks.push(unknown.length
      ? { level: 'error', title: 'Taxonomy mapping', detail: unknown.length + ' skill(s) are not in the ' + comp + ' taxonomy and cannot be published.', items: unknown.map((s) => s.name + ' — not found in the ' + comp + ' taxonomy'), action: 'request' }
      : { level: 'pass', title: 'Taxonomy mapping', detail: 'All ' + skills.length + ' skills resolve against the ' + comp + ' taxonomy (' + tax.length + ' curated skills).' });

    /* 2 — duplicates */
    const seen = {}, dupes = [];
    skills.forEach((s) => { if (seen[s.name]) dupes.push(s.name); seen[s.name] = 1; });
    checks.push(dupes.length
      ? { level: 'error', title: 'Duplicate skills', detail: dupes.length + ' skill(s) appear more than once in the matrix.', items: dupes }
      : { level: 'pass', title: 'Duplicate skills', detail: 'No skill appears twice in the matrix.' });

    /* 3 — every skill carries a target for every role level */
    const missing = skills.filter((s) => !s.targets || s.targets.some((t) => !t));
    checks.push(missing.length
      ? { level: 'error', title: 'Target proficiency', detail: missing.length + ' skill(s) are missing a target for at least one role level.', items: missing.map((s) => s.name) }
      : { level: 'pass', title: 'Target proficiency', detail: 'Every skill has a target for all ' + ROLES.length + ' role levels.' });

    /* 4 — target regression against the published version */
    const roleIdx = ROLES.indexOf(o.role || 'Manager');
    const regressions = [];
    if (roleIdx >= 0) {
      skills.forEach((s) => {
        const prev = published.filter((p) => p.skill === s.name)[0];
        if (prev && s.targets[roleIdx] < prev.targets[roleIdx]) {
          regressions.push(s.name + ' · ' + ROLES[roleIdx] + ': ' + level(prev.targets[roleIdx]) + ' → ' + level(s.targets[roleIdx]));
        }
      });
    }
    checks.push(regressions.length
      ? { level: 'warn', title: 'Target regression', detail: 'The draft lowers a published target for ' + ROLES[roleIdx] + '.', items: regressions }
      : { level: 'pass', title: 'Target regression', detail: 'No published target is lowered for ' + (ROLES[roleIdx] || 'the selected role') + '.' });

    /* 5 — monotonic progression across role levels */
    const nonMono = [];
    skills.forEach((s) => {
      for (let i = 1; i < s.targets.length; i++) {
        if (s.targets[i] < s.targets[i - 1]) {
          nonMono.push(s.name + ' · ' + ROLES[i - 1] + ' ' + level(s.targets[i - 1]) + ' → ' + ROLES[i] + ' ' + level(s.targets[i]));
          break;
        }
      }
    });
    checks.push(nonMono.length
      ? { level: 'warn', title: 'Level progression', detail: 'Targets should not drop as seniority increases.', items: nonMono }
      : { level: 'pass', title: 'Level progression', detail: 'Targets increase monotonically across the five role levels.' });

    /* 6 — learning content coverage, per skill */
    const noContent = [], thin = [];
    skills.forEach((s) => {
      const n = contentFor(s.name).length;
      if (!n) noContent.push(s.name);
      else if (n < 2) thin.push(s.name + ' · only ' + n + ' mapped resource');
    });
    if (noContent.length) {
      checks.push({ level: 'error', title: 'Learning content coverage', waivable: true, detail: 'No mapped learning content — candidates could not be given a plan. Waive only if content is being commissioned.', items: noContent });
    } else if (thin.length) {
      checks.push({ level: 'warn', title: 'Learning content coverage', detail: 'Some skills have a single mapped resource and no alternative path.', items: thin });
    } else {
      checks.push({ level: 'pass', title: 'Learning content coverage', detail: 'Every skill has at least two mapped resources.' });
    }

    /* 7 — matrix size and version status */
    if (skills.length < 3) checks.push({ level: 'warn', title: 'Matrix size', detail: 'Fewer than three skills — the benchmark may be too narrow to be meaningful.' });
    if (o.assigned && o.status && o.status !== 'Published') {
      checks.push({ level: 'warn', title: 'Version status', detail: o.assigned + ' employees are assigned while the version is in ' + o.status + '.' });
    }
    return checks;
  }

  const checkIcon = (lvl) => (lvl === 'pass' ? icon('check', 12) : lvl === 'warn' ? '!' : icon('close', 12));

  /* errors block publishing unless a waivable check has been acknowledged */
  function blockingErrors(checks, waived) {
    return checks.filter((c) => c.level === 'error' && !(c.waivable && waived && waived[c.title]));
  }

  function checksHtml(checks, opts) {
    const o = opts || {};
    const waived = draft.waived || {};
    return '<div class="check-list">' + checks.map((c) => {
      const isWaived = c.level === 'error' && c.waivable && waived[c.title];
      return '<div class="check ' + c.level + (isWaived ? ' waived' : '') + '"><div class="ci">' + checkIcon(c.level) + '</div><div>' +
        '<strong>' + c.title + (isWaived ? ' <span class="tag">waived</span>' : '') + '</strong><p>' + c.detail + '</p>' +
        (c.items && c.items.length ? '<ul>' + c.items.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul>' : '') +
        (c.action === 'request' && o.comp ? '<div class="check-action"><button class="text-button" onclick="requestSkills(\'' + o.comp + '\')">Request taxonomy addition ' + icon('arrow', 12) + '</button></div>' : '') +
        (c.waivable && o.showWaiver ? '<label class="waiver"><input type="checkbox"' + (isWaived ? ' checked' : '') +
          ' onchange="toggleWaiver(\'' + c.title + '\',this.checked)" /> Publish anyway — content is being commissioned</label>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  }

  function summaryStrip(checks) {
    return '<div class="summary-strip">' +
      '<div><span>Checks run</span><strong>' + checks.length + '</strong></div>' +
      '<div class="ok"><span>Passed</span><strong>' + checkCount(checks, 'pass') + '</strong></div>' +
      '<div class="warn"><span>Warnings</span><strong>' + checkCount(checks, 'warn') + '</strong></div>' +
      '<div class="err"><span>Errors</span><strong>' + checkCount(checks, 'error') + '</strong></div>' +
      '</div>';
  }

  window.requestSkills = function (comp) {
    const tax = taxonomySkills(comp);
    const raised = [];
    draft.skills.forEach((s) => {
      if (tax.indexOf(s.name) === -1 && !SKILL_REQUESTS.some((r) => r.skill === s.name)) {
        SKILL_REQUESTS.push({ skill: s.name, competency: comp, by: PERSONAS.leader.name, on: today() });
        raised.push(s.name);
      }
    });
    toast(raised.length ? 'Skill request submitted' : 'Already requested',
      raised.length ? raised.length + ' skill addition request(s) sent to taxonomy curation.' : 'These skills already have open requests.');
    if (raised.length) {
      pushNotification('ld', {
        type: 'request', title: raised.length + ' skill request(s) awaiting curation',
        body: comp + ' · ' + raised.join(', ') + ' — raised by ' + PERSONAS.leader.name + '.',
        action: { label: 'Run validation', onclick: 'validateAllTaxonomy()' }
      });
      pushNotification('leader', {
        type: 'request', title: 'Taxonomy addition requested',
        body: raised.join(', ') + ' sent to L&D curation for ' + comp + '.',
        action: { label: 'Review requests', onclick: 'validateAllTaxonomy()' }
      });
    }
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };

  /* ---- validation surfaces ---------------------------------------------- */
  window.validateCompetency = function (code) {
    const c = COMPETENCIES.filter((x) => x.code === code)[0];
    if (!c) return;
    const skills = benchmarkFor(c.name).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
    const checks = runChecks(c.name, skills, { published: benchmarkFor(c.name), status: c.status, assigned: c.assigned });
    openDrawer('Taxonomy validation', c.name + ' · ' + c.version + ' · ' + checkCount(checks, 'error') + ' errors · ' + checkCount(checks, 'warn') + ' warnings',
      summaryStrip(checks) + checksHtml(checks, { comp: c.name }) +
      '<div class="insight" style="margin:14px 0 0">' + icon('spark', 16) +
      '<p>Validation runs against the curated taxonomy (' + taxonomySkills(c.name).length + ' skills), the published v' +
      c.version.replace('v', '') + ' targets and the mapped content catalogue.</p></div>' +
      '<div class="button-row" style="margin-top:14px">' +
      '<button class="button button-sm" onclick="toast(\'Validation log exported\',\'' + c.name + ' validation log queued as JSON.\')">Export log</button>' +
      '<button class="button button-primary button-sm" onclick="closeDrawer();newBenchmarkFor(\'' + c.name + '\')">Create next version</button></div>');
  };

  window.validateAllTaxonomy = function () {
    const per = COMPETENCIES.map((c) => {
      const skills = benchmarkFor(c.name).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
      return { c: c, checks: runChecks(c.name, skills, { published: benchmarkFor(c.name), status: c.status, assigned: c.assigned }) };
    });
    const all = per.reduce((acc, p) => acc.concat(p.checks), []);
    const skillsChecked = per.reduce((n, p) => n + benchmarkFor(p.c.name).length, 0);

    const orphans = CONTENT.filter((x) => !Object.keys(TAXONOMY).some((k) => TAXONOMY[k].indexOf(x.skill) !== -1));
    const global = [
      orphans.length
        ? { level: 'warn', title: 'Content mapped outside the taxonomy', detail: orphans.length + ' resource(s) reference a skill that is not in any competency taxonomy.', items: orphans.map((o) => o.title + ' → ' + o.skill + ' (' + o.provider + ')') }
        : { level: 'pass', title: 'Content mapped outside the taxonomy', detail: 'Every mapped resource references a curated skill.' },
      SKILL_REQUESTS.length
        ? { level: 'warn', title: 'Pending skill requests', detail: SKILL_REQUESTS.length + ' skill addition request(s) awaiting curation.', items: SKILL_REQUESTS.map((r) => r.skill + ' · ' + r.competency + ' · ' + r.by + ' on ' + r.on) }
        : { level: 'pass', title: 'Pending skill requests', detail: 'No outstanding taxonomy requests.' }
    ];
    const everything = all.concat(global);

    const table = '<div class="panel" style="box-shadow:none"><div class="panel-header"><div><h2>Per-competency results</h2>' +
      '<p>' + skillsChecked + ' skills across ' + COMPETENCIES.length + ' benchmarks</p></div></div>' +
      '<div class="report-row-grid head"><span>Competency</span><span>Version</span><span>Status</span><span>Warnings</span><span>Errors</span></div>' +
      per.map((p) => {
        const e = checkCount(p.checks, 'error'), w = checkCount(p.checks, 'warn');
        return '<div class="report-row-grid" style="cursor:pointer" onclick="validateCompetency(\'' + p.c.code + '\')">' +
          '<div class="cell-stack"><strong>' + p.c.name + '</strong><span>' + benchmarkFor(p.c.name).length + ' skills · ' + p.c.roles + ' roles</span></div>' +
          '<span class="mono">' + p.c.version + '</span>' +
          '<span class="status ' + (p.c.status === 'Published' ? 'published' : p.c.status === 'Draft' ? 'draft' : 'review') + '">' + p.c.status + '</span>' +
          '<span class="tag ' + (w ? 'amber' : 'teal') + '">' + w + '</span>' +
          '<span class="tag ' + (e ? 'coral' : 'teal') + '">' + e + '</span></div>';
      }).join('') + '</div>';

    const errs = checkCount(everything, 'error'), warns = checkCount(everything, 'warn');

    /* the run itself is an event: tell the personas who act on the findings */
    if (errs || warns) {
      pushNotification('ld', {
        type: errs ? 'broken' : 'validate',
        title: errs ? 'Validation found ' + errs + ' blocking error(s)' : 'Taxonomy validation: ' + warns + ' warning(s)',
        body: skillsChecked + ' skills checked across ' + COMPETENCIES.length + ' benchmarks' +
          (errs ? ' · resolve errors before the next publish wave.' : ' · no blocking errors.'),
        action: { label: 'Open competencies', onclick: "go('competencies')" }
      });
    }
    if (errs) {
      pushNotification('leader', {
        type: 'validate', title: 'Blocking validation errors in your portfolio',
        body: errs + ' error(s) across ' + COMPETENCIES.length + ' benchmarks — publishing is blocked until resolved.',
        action: { label: 'Open competencies', onclick: "go('competencies')" }
      });
    }

    openDrawer('Taxonomy validation', 'All competencies · ' + errs + ' errors · ' + warns + ' warnings',
      summaryStrip(everything) + table +
      '<h2 class="section-title" style="font-size:14px">Cross-cutting checks</h2>' + checksHtml(global) +
      '<h2 class="section-title" style="font-size:14px">Benchmark checks</h2>' + checksHtml(all) +
      '<div class="button-row" style="margin-top:14px">' +
      '<button class="button button-sm" onclick="toast(\'Validation log exported\',\'Full taxonomy validation log queued as JSON.\')">Export log</button>' +
      '<button class="button button-primary button-sm" onclick="closeDrawer();newBenchmark()">New benchmark</button></div>');
  };

  /* ---- new benchmark wizard --------------------------------------------- */
  const draft = { step: 1, competency: 'Data Analytics', role: 'Manager', window: '90 days', base: 'published', skills: [], checks: [], published: false, feed: [], waived: {} };

  window.newBenchmark = function () { window.newBenchmarkFor('Data Analytics'); };
  window.newBenchmarkFor = function (comp) {
    const c = COMPETENCIES.filter((x) => x.name === comp)[0] || COMPETENCIES[0];
    draft.step = 1; draft.published = false; draft.feed = []; draft.checks = []; draft.waived = {};
    draft.competency = c.name; draft.role = 'Manager'; draft.window = '90 days'; draft.base = 'published';
    draft.skills = benchmarkFor(c.name).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
    closeDrawer();
    renderWizard();
    openModal();
  };
  window.toggleWaiver = function (title, on) {
    draft.waived[title] = !!on;
    renderWizard();
    toast(on ? 'Coverage error waived' : 'Waiver removed',
      on ? 'The waiver is recorded in the publish audit log.' : 'Content coverage must be resolved before publishing.');
  };
  window.openModal = function () { $('#modalWrap').classList.add('open'); $('#modalWrap').setAttribute('aria-hidden', 'false'); };
  window.closeModal = function () { $('#modalWrap').classList.remove('open'); $('#modalWrap').setAttribute('aria-hidden', 'true'); };
  window.wizardStep = function (n) {
    draft.step = n;
    if (n === 2 || n === 3) draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };
  window.selectDraftCompetency = function (name) {
    draft.competency = name;
    draft.skills = benchmarkFor(name).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };
  window.setDraftField = function (field, value) {
    draft[field] = value;
    if (field === 'base' && value === 'blank') {
      draft.skills.forEach((s) => { s.targets = s.targets.map(() => 2); });
    } else if (field === 'base') {
      draft.skills = benchmarkFor(draft.competency).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
    }
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };
  window.validateDraft = function () {
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
    const e = checkCount(draft.checks, 'error'), w = checkCount(draft.checks, 'warn');
    toast(e ? 'Validation found ' + e + ' error(s)' : 'Taxonomy validated',
      draft.skills.length + ' skills checked against the ' + draft.competency + ' taxonomy · ' + e + ' error(s), ' + w + ' warning(s)');
  };
  window.setDraftTarget = function (idx, roleIdx, value) {
    draft.skills[idx].targets[roleIdx] = Number(value);
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };
  window.removeDraftSkill = function (idx) {
    draft.skills.splice(idx, 1);
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
  };
  window.addDraftSkill = function () {
    const sel = $('#draftSkillPick');
    const custom = $('#draftSkillCustom');
    const name = (custom && custom.value.trim()) || (sel && sel.value) || '';
    if (!name) { toast('Pick a skill', 'Choose a taxonomy skill or type a new skill name.'); return; }
    if (draft.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) { toast('Already in the matrix', name + ' is already a required skill.'); return; }
    const tax = taxonomySkills(draft.competency);
    const inTax = tax.indexOf(name) !== -1;
    draft.skills.push({
      name: name, type: /storytelling|management|communication/i.test(name) ? 'Business' : 'Technical',
      targets: BASE_TARGETS.slice(), source: inTax ? 'taxonomy' : 'custom'
    });
    if (custom) custom.value = '';
    draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
    renderWizard();
    toast(inTax ? 'Skill added' : 'Skill not in taxonomy', inTax
      ? name + ' added from the ' + draft.competency + ' taxonomy.'
      : name + ' is not in the taxonomy — validation will flag it and you can request an addition.');
  };

  window.publishDraft = function () {
    const comp = draft.competency;
    const c = COMPETENCIES.filter((x) => x.name === comp)[0];
    draft.checks = runChecks(comp, draft.skills, { published: benchmarkFor(comp), role: draft.role });
    const blocking = blockingErrors(draft.checks, draft.waived);
    if (blocking.length) {
      renderWizard();
      toast('Publish blocked', blocking.length + ' validation error(s) must be resolved first.');
      return;
    }
    const waivedTitles = draft.checks.filter((ch) => ch.level === 'error' && ch.waivable && draft.waived[ch.title]).map((ch) => ch.title);

    /* state changes happen immediately; the feed below is a staged reveal */
    const audience = ROLE_AUDIENCE[draft.role] || 0;
    const previous = c.version;
    const newVersion = nextVersion(previous);
    versionHistory(c).forEach((r) => { if (r[3] === 'Current') r[3] = 'Superseded'; });
    state.versions[c.code].unshift([newVersion, 'Published ' + today(), audience, 'Current']);
    c.version = newVersion;
    c.updated = today();
    c.status = 'Published';
    c.assigned = (c.assigned || 0) + audience;
    c.owner = PERSONAS.leader.name;
    c.justPublished = true;
    if (!state.publishLog) state.publishLog = [];
    state.publishLog.push({
      competency: comp, code: c.code, version: newVersion, role: draft.role, audience: audience,
      on: today(), skills: draft.skills.length, waived: waivedTitles
    });

    draft.published = true;
    draft.feed = [
      ['benchmark.published', 'Benchmark ' + newVersion + ' emitted for ' + comp + ' · ' + draft.role + ' (' + draft.skills.length + ' skills)'],
      ['Assignment engine', 'Matching users on role + competency · ' + audience + ' employees in scope'],
      ['Fan-out complete', audience + ' employees assigned with a ' + draft.window + ' window'],
      ['Notification dispatched', 'Email + in-app + Teams delivered · initial assessments now due'],
      ['Version recorded', previous + ' superseded · in-flight plans stay on ' + previous + ' unless re-assigned']
    ];
    if (waivedTitles.length) {
      draft.feed.push(['Waiver recorded', waivedTitles.join(', ') + ' waived · flagged for content commissioning in the publish audit log']);
    }

    /* notifications for every persona affected by the publish */
    pushNotification('leader', {
      type: 'publish', title: 'Benchmark published: ' + comp + ' ' + newVersion,
      body: draft.role + ' · ' + audience + ' employees assigned with a ' + draft.window + ' window.',
      action: { label: 'Open benchmark', onclick: "openCompetency('" + c.code + "')" }
    });
    if (draft.role === 'Manager' || draft.role === 'Sr. Manager') {
      pushNotification('manager', {
        type: 'team', title: 'Your team’s benchmark changed',
        body: comp + ' ' + newVersion + ' now applies to ' + draft.role + 's. Review the affected plans and timelines.',
        action: { label: 'Open team reports', onclick: "go('reports')" }
      });
    }
    if (draft.role === 'Associate' || draft.role === 'Sr. Associate') {
      pushNotification('candidate', {
        type: 'assigned', title: 'New benchmark assigned to you',
        body: comp + ' ' + newVersion + ' · ' + draft.role + ' — your initial assessment is now due.',
        action: { label: 'Open my plan', onclick: "go('overview')" }
      });
    }
    if (waivedTitles.length) {
      pushNotification('ld', {
        type: 'mapped', title: 'Published with a content waiver',
        body: comp + ' ' + newVersion + ' waived: ' + waivedTitles.join(', ') + '. Commission content before the next wave.',
        action: { label: 'Open library', onclick: "go('content')" }
      });
    }

    renderWizard();
    if (state.view === 'competencies') renderCompetencies();
    toast('Benchmark published', comp + ' ' + newVersion + ' · ' + audience + ' ' + draft.role + 's assigned' +
      (waivedTitles.length ? ' · 1 waiver recorded' : ''));
  };

  function renderWizard() {
    const steps = ['Scope', 'Skill targets', 'Review & assign'];
    const head = '<div class="modal-head"><button class="icon-button" onclick="closeModal()" aria-label="Close">' + icon('close', 15) + '</button>' +
      '<span class="eyebrow">Benchmark management</span><h2>' + (draft.published ? 'Benchmark published' : 'New benchmark') + '</h2>' +
      '<p>' + (draft.published
        ? draft.competency + ' · ' + draft.role + ' · ' + COMPETENCIES.filter((x) => x.name === draft.competency)[0].version
        : 'Competency and role → target proficiency per skill → validate → publish and assign') + '</p></div>';

    const stepper = '<div class="wizard-steps">' + steps.map((s, i) => {
      const n = i + 1;
      const cls = draft.published || draft.step > n ? 'done' : (draft.step === n ? 'on' : '');
      return '<div class="wizard-step ' + cls + '"><span class="ws-n">' + (draft.published || draft.step > n ? icon('check', 12) : n) + '</span>' + s + '</div>' + (i < 2 ? '<i></i>' : '');
    }).join('') + '</div>';

    let body = '', foot = '';

    if (draft.published) {
      body = stepper +
        '<div class="summary-strip">' +
        '<div class="ok"><span>Version</span><strong>' + COMPETENCIES.filter((x) => x.name === draft.competency)[0].version + '</strong></div>' +
        '<div><span>Competency</span><strong style="font-size:14px">' + draft.competency + '</strong></div>' +
        '<div><span>Role</span><strong style="font-size:14px">' + draft.role + '</strong></div>' +
        '<div class="ok"><span>Assigned</span><strong>' + (ROLE_AUDIENCE[draft.role] || 0) + '</strong></div></div>' +
        '<div class="assign-feed">' + draft.feed.map(([t, d], i) =>
          '<div class="feed-step" style="animation-delay:' + (i * 0.12) + 's"><div class="ci">' + icon('check', 12) + '</div>' +
          '<div><strong>' + t + '</strong><p>' + d + '</p></div></div>').join('') + '</div>' +
        '<div class="insight" style="margin:16px 0 0">' + icon('spark', 16) +
        '<p>Employees already working a plan keep their current version. Re-assign explicitly to move them onto ' +
        COMPETENCIES.filter((x) => x.name === draft.competency)[0].version + '.</p></div>';
      foot = '<span class="hint-text">' + checkCount(draft.checks, 'warn') + ' warning(s) recorded in the audit log</span>' +
        '<div class="button-row"><button class="button button-sm" onclick="closeModal();validateCompetency(\'' +
        COMPETENCIES.filter((x) => x.name === draft.competency)[0].code + '\')">View validation report</button>' +
        '<button class="button button-primary button-sm" onclick="closeModal();go(\'competencies\')">Back to catalogue</button></div>';
    } else if (draft.step === 1) {
      const c = COMPETENCIES.filter((x) => x.name === draft.competency)[0];
      body = stepper +
        '<div class="form-grid">' +
        '<div class="field"><label for="draftCompetency">Competency</label>' +
        '<select id="draftCompetency" onchange="selectDraftCompetency(this.value)">' +
        COMPETENCIES.map((x) => '<option' + (x.name === draft.competency ? ' selected' : '') + '>' + x.name + '</option>').join('') + '</select>' +
        '<span class="help">' + taxonomySkills(draft.competency).length + ' curated skills · ' + c.roles + ' role levels</span></div>' +
        '<div class="field"><label for="draftRole">Role</label><select id="draftRole" onchange="setDraftField(\'role\',this.value)">' +
        ROLES.map((r) => '<option' + (r === draft.role ? ' selected' : '') + '>' + r + '</option>').join('') + '</select>' +
        '<span class="help">' + (ROLE_AUDIENCE[draft.role] || 0) + ' employees currently match this role</span></div>' +
        '<div class="field"><label for="draftWindow">Plan window</label><select id="draftWindow" onchange="setDraftField(\'window\',this.value)">' +
        ['60 days', '90 days', '180 days'].map((w) => '<option' + (w === draft.window ? ' selected' : '') + '>' + w + '</option>').join('') + '</select>' +
        '<span class="help">Time-bound window applied to every generated learning plan</span></div>' +
        '<div class="field"><label for="draftBase">Base on</label><select id="draftBase" onchange="setDraftField(\'base\',this.value)">' +
        '<option value="published"' + (draft.base === 'published' ? ' selected' : '') + '>' + c.version + ' (published targets)</option>' +
        '<option value="blank"' + (draft.base === 'blank' ? ' selected' : '') + '>Blank matrix</option></select>' +
        '<span class="help">Blank starts from Intermediate (I) for every skill and role</span></div>' +
        '</div>' +
        '<div class="insight" style="margin:16px 0 0">' + icon('spark', 16) +
        '<p>Publishing creates <strong>' + nextVersion(c.version) + '</strong> and fans out to every employee matching ' +
        draft.competency + ' · ' + draft.role + '. Existing plans stay on ' + c.version + '.</p></div>';
      foot = '<span class="hint-text">Step 1 of 3</span><div class="button-row">' +
        '<button class="button button-sm" onclick="closeModal()">Cancel</button>' +
        '<button class="button button-primary button-sm" onclick="wizardStep(2)">Continue to skill targets ' + icon('arrow', 13) + '</button></div>';
    } else if (draft.step === 2) {
      const errs = checkCount(draft.checks, 'error'), warns = checkCount(draft.checks, 'warn');
      const blocking = blockingErrors(draft.checks, draft.waived).length;
      const rows = draft.skills.map((s, i) => {
        const inTax = taxonomySkills(draft.competency).indexOf(s.name) !== -1;
        return '<div class="skill-edit-row"><div class="skill-name"><div><strong>' + s.name + '</strong>' +
          '<span>' + s.type + (inTax ? '' : ' · not in taxonomy') + '</span></div></div>' +
          s.targets.map((t, ri) =>
            '<select class="lvl-select target-' + t + '" onchange="setDraftTarget(' + i + ',' + ri + ',this.value)">' +
            LEVELS.map((l, li) => '<option value="' + (li + 1) + '"' + (t === li + 1 ? ' selected' : '') + '>' + l.charAt(0) + '</option>').join('') +
            '</select>').join('') +
          '<button class="icon-button compact" onclick="removeDraftSkill(' + i + ')" aria-label="Remove skill">' + icon('close', 14) + '</button></div>';
      }).join('');

      const addable = taxonomySkills(draft.competency).filter((s) => !draft.skills.some((x) => x.name === s));
      body = stepper +
        '<div class="skill-editor">' +
        '<div class="skill-edit-row head"><span>Skill</span>' + ROLES.map((r) => '<span>' + r.replace('Sr. ', 'Sr.') + '</span>').join('') + '<span></span></div>' +
        rows +
        '<div class="skill-add">' +
        '<select id="draftSkillPick"><option value="">Add from taxonomy…</option>' +
        addable.map((s) => '<option>' + s + '</option>').join('') + '</select>' +
        '<input id="draftSkillCustom" placeholder="…or type a new skill" />' +
        '<button class="button button-sm" onclick="addDraftSkill()">' + icon('plus', 13) + ' Add skill</button>' +
        '<span class="help" style="font-size:10.5px;color:var(--muted-2)">B = Beginner · I = Intermediate · A = Advanced · E = Expert</span></div></div>' +
        '<div class="summary-strip" style="margin-top:16px">' +
        '<div><span>Skills</span><strong>' + draft.skills.length + '</strong></div>' +
        '<div class="ok"><span>Passed</span><strong>' + checkCount(draft.checks, 'pass') + '</strong></div>' +
        '<div class="warn"><span>Warnings</span><strong>' + warns + '</strong></div>' +
        '<div class="err"><span>Errors</span><strong>' + errs + '</strong></div></div>' +
        checksHtml(draft.checks, { comp: draft.competency, showWaiver: true });
      foot = '<span class="hint-text">Step 2 of 3 · ' + blocking + ' blocking error(s), ' + warns + ' warning(s)</span>' +
        '<div class="button-row">' +
        '<button class="button button-sm" onclick="wizardStep(1)">Back</button>' +
        '<button class="button button-sm" onclick="validateDraft()">' + icon('check', 13) + ' Validate taxonomy</button>' +
        '<button class="button button-primary button-sm"' + (blocking ? ' disabled' : '') + ' onclick="wizardStep(3)">Review &amp; publish ' + icon('arrow', 13) + '</button></div>';
    } else {
      const c = COMPETENCIES.filter((x) => x.name === draft.competency)[0];
      const errs = checkCount(draft.checks, 'error');
      const blocking = blockingErrors(draft.checks, draft.waived).length;
      body = stepper +
        '<div class="summary-strip">' +
        '<div><span>Competency</span><strong style="font-size:14px">' + draft.competency + '</strong></div>' +
        '<div><span>Role</span><strong style="font-size:14px">' + draft.role + '</strong></div>' +
        '<div><span>New version</span><strong>' + nextVersion(c.version) + '</strong></div>' +
        '<div><span>Audience</span><strong>' + (ROLE_AUDIENCE[draft.role] || 0) + '</strong></div></div>' +
        '<div class="panel" style="box-shadow:none"><div class="panel-header"><div><h2>Matrix to publish</h2>' +
        '<p>' + draft.skills.length + ' skills · ' + draft.window + ' plan window · supersedes ' + c.version + '</p></div>' +
        '<span class="tag ' + (blocking ? 'coral' : 'teal') + '">' + (blocking ? blocking + ' blocking error' + (blocking > 1 ? 's' : '') : 'Ready to publish') + '</span></div>' +
        '<div class="report-row-grid head"><span>Skill</span><span>Assoc.</span><span>Sr. Assoc.</span><span>Manager</span><span>Sr. Mgr / Dir.</span></div>' +
        draft.skills.map((s) =>
          '<div class="report-row-grid"><div class="cell-stack"><strong>' + s.name + '</strong><span>' + s.type + '</span></div>' +
          '<span>' + level(s.targets[0]).charAt(0) + '</span><span>' + level(s.targets[1]).charAt(0) + '</span>' +
          '<span>' + level(s.targets[2]).charAt(0) + '</span><span>' + level(s.targets[3]).charAt(0) + ' / ' + level(s.targets[4]).charAt(0) + '</span></div>').join('') +
        '</div>' +
        '<h2 class="section-title" style="font-size:14px">Validation</h2>' + checksHtml(draft.checks, { comp: draft.competency, showWaiver: true });
      foot = '<span class="hint-text">' + (blocking ? blocking + ' error(s) must be resolved or waived before publishing'
        : 'Step 3 of 3 · ready to publish' + (errs ? ' · ' + errs + ' waiver recorded' : '')) + '</span>' +
        '<div class="button-row">' +
        '<button class="button button-sm" onclick="wizardStep(2)">Back</button>' +
        '<button class="button button-primary button-sm"' + (blocking ? ' disabled' : '') + ' onclick="publishDraft()">' +
        icon('arrow', 13) + ' Publish &amp; assign</button></div>';
    }

    $('#modal').innerHTML = head + '<div class="modal-body">' + body + '</div><div class="modal-foot">' + foot + '</div>';
  }

  window.publishBenchmark = function (name) {
    window.newBenchmarkFor(name);
    toast('New version', 'Review the targets for ' + name + ', then publish to assign.');
  };

  /* ----------------------------------------------------------- people view */
  function renderPeople() {
    const comps = ['all'].concat(Object.keys(SKILL_SETS));
    const sel = $('#peopleCompFilter');
    if (sel.options.length !== comps.length) {
      sel.innerHTML = comps.map((c) => '<option value="' + c + '">' + (c === 'all' ? 'All competencies' : c) + '</option>').join('');
    }
    const onTrack = PEOPLE.filter((p) => p.status === 'On track').length;
    const behind = PEOPLE.filter((p) => p.status === 'Behind').length;
    const done = PEOPLE.filter((p) => p.status === 'Completed').length;
    $('#peopleSummary').innerHTML =
      summaryCard('users', 'Total people', '248', '12 added this month') +
      summaryCard('target', 'On track', '184', '74% of assignments') +
      summaryCard('clock', 'Need attention', '9', '9 currently overdue', 'warm') +
      summaryCard('check', 'Completed', '40', '16% completion rate');

    const st = $('#peopleStatusFilter').value, cf = sel.value, q = state.query.toLowerCase();
    const rows = PEOPLE.filter((p) =>
      (st === 'all' || p.status === st) && (cf === 'all' || p.comp === cf) &&
      (!q || p.name.toLowerCase().includes(q) || p.comp.toLowerCase().includes(q) || p.focus.toLowerCase().includes(q)));

    $('#peopleTable').innerHTML =
      '<div class="directory-row directory-head"><span>Person</span><span>Competency</span><span>Status</span><span>Progress</span><span>Timeline</span><span>Actions</span></div>' +
      (rows.length ? rows.map((p) =>
        '<div class="directory-row" onclick="openPerson(\'' + p.id + '\')">' +
          '<div class="person-cell"><div class="avatar ' + p.tint + '">' + p.initials + '</div><div><strong>' + p.name + '</strong><em>' + p.role + '</em></div></div>' +
          '<span style="font-size:11.5px">' + p.comp + '</span>' +
          '<span class="status ' + statusClass(p.status) + '">' + p.status + '</span>' +
          '<div class="row-progress"><div class="progress-track ' + (p.status === 'Behind' ? 'coral' : '') + '"><span style="width:' + p.progress + '%"></span></div><strong>' + p.progress + '%</strong></div>' +
          '<span class="due' + (p.urgent ? ' urgent' : '') + '">' + p.due + '</span>' +
          '<div class="row-actions"><button class="nudge-button" onclick="event.stopPropagation();nudge(\'' + p.name + '\')">Nudge</button>' +
          '<button class="icon-button compact" onclick="event.stopPropagation();openPerson(\'' + p.id + '\')">' + icon('chevron', 15) + '</button></div>' +
        '</div>').join('')
        : '<div class="empty-state">No people match “' + esc(state.query || st) + '”.</div>') +
      '<div class="empty-state" style="padding:12px;border-top:1px solid var(--line-soft);font-size:11px">Showing ' + rows.length + ' of 248 people · ' + onTrack + ' on track · ' + behind + ' behind · ' + done + ' completed in this view</div>';
  }

  window.openPerson = function (id) {
    const p = PEOPLE.filter((x) => x.id === id)[0];
    if (!p) return;
    const skills = skillLevels(p);
    openDrawer(p.name, p.role + ' · ' + p.comp + ' · benchmark v3.2', 
      '<div class="panel" style="box-shadow:none"><div class="panel-body">' +
        '<div class="row-progress" style="margin-bottom:6px"><div class="progress-track ' + (p.status === 'Behind' ? 'coral' : '') + '" style="flex:1"><span style="width:' + p.progress + '%"></span></div><strong>' + p.progress + '%</strong></div>' +
        '<div style="font-size:11px;color:var(--muted)">Benchmark readiness · status ' + p.status + ' · timeline ' + p.due + '</div>' +
        '<div class="button-row" style="margin-top:14px">' +
          '<button class="button button-sm" onclick="nudge(\'' + p.name + '\')">Send nudge</button>' +
          '<button class="button button-sm" onclick="toast(\'1:1 scheduled\',\'Check-in proposed with ' + p.name + '.\')">Schedule 1:1</button>' +
          '<button class="button button-sm" onclick="toast(\'Report card\',\'Opening the latest report card for ' + p.name + '.\')">Report card</button>' +
          '<button class="button button-sm" onclick="toast(\'Flagged to leader\',\'' + p.name + ' flagged to the ' + p.comp + ' competency leader.\')">Flag to leader</button>' +
        '</div></div></div>' +
      '<div class="panel" style="box-shadow:none;margin-top:14px"><div class="panel-header"><div><h2>Skill detail</h2><p>Target versus assessed proficiency</p></div></div>' +
      '<div class="panel-body pad-top">' + skills.map((s) =>
        '<div style="padding:9px 0;border-top:1px solid var(--line-soft)">' +
          '<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">' +
          '<strong style="font-size:12px;color:#40504a">' + s.name + '</strong>' +
          '<span class="status ' + (s.met ? 'on-track' : 'behind') + '">' + (s.met ? 'Met' : 'In progress') + '</span></div>' +
          '<div class="gap-line" style="margin-top:8px"><span class="lbl">Assessed</span>' +
            '<div class="tr"><div class="fl" style="width:' + (s.level / 4 * 100) + '%;background:linear-gradient(90deg,#35a58f,#147e6f)"></div></div>' +
            '<span class="val">' + level(s.level) + '</span></div>' +
          '<div class="gap-line"><span class="lbl">Target</span>' +
            '<div class="tr"><div class="fl" style="width:' + (s.target / 4 * 100) + '%;background:linear-gradient(90deg,#f0a48d,#e8785d)"></div></div>' +
            '<span class="val">' + level(s.target) + '</span></div>' +
        '</div>').join('') + '</div></div>' +
      '<div class="insight" style="margin:14px 0 0">' + icon('clock', 16) + '<p>' + (p.status === 'Behind'
        ? 'Timeline closes in <strong>' + p.due + '</strong> with ' + skills.filter((s) => !s.met).length + ' skill(s) open. Re-assessment is triggered each time a plan section is marked complete.'
        : 'On schedule. The next re-assessment is triggered automatically when the current plan section is marked complete.') + '</p></div>');
  };

  /* ---------------------------------------------------------- reports view
     Reports are persona-scoped: the same route shows organisation outcomes to
     L&D, competency outcomes to the leader, team outcomes to the manager and a
     personal record to the candidate. */

  function outcomeDonut(total, label, rows, note) {
    const stops = [['#147e6f', rows[0][2]], ['#e5b956', rows[1][2]], ['#e8785d', rows[2][2]]];
    const a = rows[0][2], b = rows[0][2] + rows[1][2];
    return '<div class="outcome-visual">' +
      '<div class="donut" style="background:conic-gradient(#147e6f 0 ' + a + '%, #e5b956 ' + a + '% ' + b + '%, #e8785d ' + b + '% 100%)">' +
      '<div><strong>' + total + '</strong><span>' + label + '</span></div></div>' +
      '<div class="outcome-legend">' +
        stops.map(([c, l, v]) => '<div><i style="background:' + c + '"></i><span>' + l + '</span><strong>' + v + '%</strong></div>').join('') +
        (note ? '<div style="border:0;padding-top:12px"><span style="font-size:10.5px;color:var(--muted-2)">' + note + '</span></div>' : '') +
      '</div></div>';
  }

  function savedReportsPanel(title, sub, list) {
    return panel(title, sub, list.map(([t, s]) =>
      '<div class="saved-report"><div class="report-icon">' + icon('file', 15) + '</div>' +
      '<div><strong>' + t + '</strong><span>' + s + '</span></div>' +
      '<button class="button button-sm" onclick="toast(\'Report is being prepared\',\'' + t + ' will be emailed when ready.\')">Run</button></div>').join(''));
  }

  function reportCardsPanel(title, sub, rows, action) {
    return panel(title, sub, rows.map(([n, ini, tint, comp, verdict, detail, date]) =>
      '<div class="report-row"><div class="avatar ' + tint + '">' + ini + '</div>' +
      '<div><strong>' + n + '</strong><span>' + comp + ' · ' + detail + '</span></div>' +
      '<span class="status ' + (verdict === 'Success' ? 'completed' : verdict === 'Partial' ? 'review' : verdict === 'Fail' ? 'failed' : 'draft') + '">' + verdict + '</span>' +
      '<span class="tag">' + date + '</span>' +
      '<button class="text-button" onclick="toast(\'Report card opened\',\'' + n + ' · ' + comp + ' · ' + detail + '\')">Open ' + icon('arrow', 13) + '</button></div>').join(''),
      action ? { toolbar: action } : undefined);
  }

  /* ---- L&D: organisation programme outcomes ----------------------------- */
  function reportsLD() {
    return {
      eyebrow: 'Outcomes & reporting · organisation scope',
      title: 'Programme outcomes',
      lede: 'Completion, proficiency gains and time-to-close across all 6 competencies and 12,480 closed plans.',
      actions: [['Export report', "toast('Report is being prepared','Programme outcomes will be emailed when ready.')"],
        ['Create report', "toast('Report builder','Choose metrics, competencies and a date range to create a report.')", true]],
      summary:
        summaryCard('check', 'Successful', '68%', 'of 12,480 closed plans') +
        summaryCard('clock', 'Partial', '23%', 'mostly timeline expiry', 'warm') +
        summaryCard('alert', 'Failed', '9%', '1,123 plans closed unresolved', 'warm') +
        summaryCard('trend', 'Avg. time-to-close', '42d', '5 days faster QoQ'),
      body:
        '<div class="reports-grid">' +
          panel('Outcome distribution', 'Report cards issued in the last 90 days', outcomeDonut('12,480', 'report cards',
            [['Success', 0, 68], ['Partial', 0, 23], ['Fail', 0, 9]], 'Timeline expiry accounts for 71% of partial outcomes.')) +
          savedReportsPanel('Saved reports', 'Ready to run or schedule', SAVED_REPORTS) +
        '</div>' +
        '<div class="dashboard-grid single">' +
          reportCardsPanel('Recent report cards', 'Latest outcomes distributed to managers and competency leaders', RECENT_CARDS,
            '<button class="text-button" onclick="toast(\'Report cards\',\'Opening the full report card register.\')">View all →</button>') +
        '</div>' +
        '<div class="dashboard-grid">' +
          panel('Time-to-close by skill', 'Median days from assessment to skill Met',
            '<div class="panel-body pad-top">' + barRows(TTC.map(([s, d]) => [s, Math.round(d / 70 * 100), d + 'd']), '', 'linear-gradient(90deg,#35a58f,#147e6f)') + '</div>') +
          panel('Scheduled reports', 'Automatic distribution', SCHEDULED.map(([t, w]) =>
            '<div class="saved-report"><div class="report-icon">' + icon('calendar', 15) + '</div><div><strong>' + t + '</strong><span>' + w + '</span></div></div>').join('')) +
        '</div>' +
        '<div class="dashboard-grid">' +
          panel('Pass rate by provider', 'First-attempt re-assessment pass rate, by content source',
            '<div class="panel-body pad-top">' + barRows([['Internal academy / LMS', 86], ['Coursera', 81], ['Microsoft Learn', 79], ['LinkedIn Learning', 74], ['Other public providers', 63]], '%') + '</div>') +
          panel('Programme funnel', 'All competencies · rolling 90 days',
            '<div class="panel-body pad-top">' + FUNNEL.map(([l, n, pct]) =>
              '<div class="funnel-row"><span>' + l + '</span><div class="funnel-bar" style="width:' + pct + '%">' +
              (pct > 22 ? n.toLocaleString('en-GB') : '') + '</div><span class="val">' + pct + '%</span></div>').join('') + '</div>') +
        '</div>'
    };
  }

  /* ---- Competency leader: portfolio outcomes ---------------------------- */
  function reportsLeader() {
    const byRole = [['Associate', 78], ['Sr. Associate', 71], ['Manager', 64], ['Sr. Manager', 55], ['Director', 48]];
    const bySkill = [['SQL', 81], ['Python', 74], ['Data visualization', 69], ['Data storytelling', 58], ['Statistical analysis', 52]];
    return {
      eyebrow: 'Outcomes & reporting · ' + PERSONAS.leader.name + ' · Data Analytics',
      title: 'Competency outcomes',
      lede: 'Data Analytics portfolio — benchmark effectiveness, role-level outcomes and at-risk cohorts across 412 closed plans.',
      actions: [['Schedule roll-up', "toast('Scheduled','A monthly Data Analytics roll-up will be emailed to you on the 1st.')"],
        ['Export board pack', "toast('Board pack queued','Data Analytics outcomes pack (PDF) is being generated.')", true]],
      summary:
        summaryCard('check', 'Successful', '64%', 'of 412 closed plans in Data Analytics') +
        summaryCard('clock', 'Partial', '27%', '111 plans closed on expiry', 'warm') +
        summaryCard('alert', 'Failed', '9%', '37 plans need follow-up', 'warm') +
        summaryCard('target', 'Proficiency vs target', '63%', 'of all targeted skills in the portfolio'),
      body:
        '<div class="reports-grid">' +
          panel('Outcome by role level', 'Success rate of closed plans, by benchmark role level',
            '<div class="panel-body pad-top">' + barRows(byRole, '%') + '</div>',
            { toolbar: '<span class="tag amber">Director 48% — lowest</span>' }) +
          panel('Skill-level outcomes', 'Share of assigned employees at or above target',
            '<div class="panel-body pad-top">' + barRows(bySkill, '%', 'linear-gradient(90deg,#e8785d,#d4553f)') + '</div>') +
        '</div>' +
        '<div class="dashboard-grid">' +
          panel('Benchmark version effectiveness', 'Closed plans grouped by the version they were assigned',
            '<div class="panel-body" style="padding:0 0 14px"><div class="report-row-grid head"><span>Version</span><span>Plans</span><span>Success</span><span>Avg. close</span><span>Status</span></div>' +
            [['v3.2', '248', '64%', '38d', 'Current'],
             ['v3.1', '238', '58%', '44d', 'Superseded'],
             ['v3.0', '221', '51%', '49d', 'Superseded']].map(([v, p, s, t, st]) =>
              '<div class="report-row-grid"><div class="cell-stack"><strong>' + v + '</strong><span>' + p + ' assigned</span></div>' +
              '<span>' + s + '</span><span>' + t + '</span><span class="tag ' + (st === 'Current' ? 'teal' : '') + '">' + st + '</span></div>').join('') + '</div>') +
          panel('At-risk cohorts', 'Groups most likely to close on expiry', 
            [['Managers · Data storytelling', '14 learners · 6 days left', 'Nudge cohort'],
             ['Directors · Statistical analysis', '9 learners · 11 days left', 'Escalate'],
             ['Associates · Python', '22 learners · 19 days left', 'Nudge cohort'],
             ['Sr. Managers · Data visualization', '7 learners · 24 days left', 'Monitor']].map(([t, s, a]) =>
              '<div class="report-row"><div class="report-icon">' + icon('clock', 15) + '</div>' +
              '<div><strong>' + t + '</strong><span>' + s + '</span></div>' +
              '<button class="button button-sm" onclick="toast(\'Cohort action\',\'' + a + ' · ' + t + '\')">' + a + '</button></div>').join('')) +
        '</div>' +
        '<div class="dashboard-grid single">' +
          reportCardsPanel('Report cards awaiting your review', 'Latest outcomes in your competency', RECENT_CARDS.slice(0, 4)) +
        '</div>' +
        '<div class="dashboard-grid single">' +
          savedReportsPanel('Saved reports', 'Competency-scoped, ready to run or schedule',
            [['Data Analytics quarterly outcomes', 'Updated ' + today() + ' · PDF'],
             ['Benchmark effectiveness v3.2', 'Updated 18 May · XLSX'],
             ['Role-level readiness by skill', 'Updated 09 May · XLSX'],
             ['At-risk cohort register', 'Updated 06 May · CSV']]) +
        '</div>'
    };
  }

  /* ---- People manager: team outcomes ------------------------------------ */
  function reportsManager() {
    const team = [
      ['Priya Raman', 'PR', 'green', 'Data Analytics', 'Success', '6 of 6 skills met', '20 May'],
      ['Kavya Nair', 'KN', 'purple', 'Product Management', 'Success', '8 of 8 skills met', '20 May'],
      ['Rohan Kulkarni', 'RK', 'blue', 'Cloud Engineering', 'Success', '5 of 5 skills met', '18 May'],
      ['Neha Joshi', 'NJ', 'peach', 'Cloud Engineering', 'Success', '6 of 6 skills met', '17 May'],
      ['Meera Iyer', 'MI', 'blue', 'Data Analytics', 'Partial', '3 of 6 skills met', '16 May'],
      ['Arjun Malhotra', 'AJ', 'amber', 'Data Analytics', 'Partial', '4 of 6 skills met', '14 May'],
      ['Diya Banerjee', 'DB', 'coral', 'Risk & Compliance', 'Fail', '2 of 6 skills met', '11 May']
    ];
    return {
      eyebrow: 'Outcomes & reporting · ' + PERSONAS.manager.name + ' · my team',
      title: 'Team outcomes',
      lede: '7 direct reports — how your team closed this cycle against the Data Analytics competency average.',
      actions: [['Share with leader', "toast('Shared','Team outcomes shared with Ananya Rao, the Data Analytics competency leader.')"],
        ['Export team report', "toast('Export queued','Team outcomes report (PDF) is being generated.')", true]],
      summary:
        summaryCard('check', 'Team outcomes', '4 Success', 'of 7 reports this cycle') +
        summaryCard('trend', 'Avg. proficiency', '71%', '+6% this quarter') +
        summaryCard('clock', 'Closes in < 14 days', '2 plans', 'need intervention', 'warm') +
        summaryCard('target', 'Avg. time-to-close', '36d', '6 days better than the org'),
      body:
        '<div class="dashboard-grid single">' +
          reportCardsPanel('My team’s report cards', 'Outcomes for this cycle, newest first', team,
            '<button class="text-button" onclick="go(\'people\')">Open people ' + icon('arrow', 13) + '</button>') +
        '</div>' +
        '<div class="dashboard-grid">' +
          panel('Skill gaps in my team', 'Share of reports not yet at target proficiency',
            '<div class="panel-body pad-top">' + barRows([['Statistical analysis', 43, '3 of 7'], ['Data storytelling', 29, '2 of 7'],
              ['Python', 14, '1 of 7'], ['Data visualization', 0, '0 of 7']], '', 'linear-gradient(90deg,#e8785d,#d4553f)') + '</div>') +
          panel('Team vs organisation', 'Key outcome measures side by side',
            '<div class="panel-body" style="padding:14px 0 6px">' +
            [['Closed-plan success rate', '57%', '68%', 'down'], ['First-attempt re-assessment pass', '79%', '83%', 'down'],
             ['Avg. time-to-close', '36d', '42d', 'up'], ['Avg. proficiency vs target', '71%', '63%', 'up']].map(([l, t, o, dir]) =>
              '<div class="fact-row"><span>' + l + '</span><span style="display:flex;gap:12px;align-items:baseline"><strong>' + t + '</strong>' +
              '<span style="font-size:10.5px;color:var(--muted-2)">org ' + o + '</span>' +
              '<span style="font-size:10.5px;color:' + (dir === 'up' ? 'var(--teal)' : 'var(--coral-deep)') + '">' + (dir === 'up' ? '▲ better' : '▼ behind') + '</span></span></div>').join('') + '</div>') +
        '</div>' +
        '<div class="dashboard-grid">' +
          panel('Recommended follow-ups', 'Generated from outcome and timeline risk', 
            '<div class="focus-card urgent-card">' + icon('clock', 16) + '<div><strong>Diya Banerjee closed on Fail</strong>' +
            '<p>2 of 6 skills met. Decide between a remedial cycle or a documented development plan.</p>' +
            '<button onclick="toast(\'Escalated\',\'Diya Banerjee escalated to the Risk &amp; Compliance competency leader.\')">Escalate →</button></div></div>' +
            '<div class="focus-card urgent-card">' + icon('alert', 16) + '<div><strong>Meera Iyer — partial outcome</strong>' +
            '<p>Data storytelling and Statistical analysis remained open at expiry.</p>' +
            '<button onclick="toast(\'Remedial cycle\',\'A 30-day remedial plan was proposed for Meera Iyer.\')">Propose remedial plan →</button></div></div>' +
            '<div class="focus-card">' + icon('spark', 16) + '<div><strong>Recognise 4 successful closures</strong>' +
            '<p>Priya Raman, Kavya Nair, Rohan Kulkarni and Neha Joshi all closed ahead of schedule.</p>' +
            '<button onclick="toast(\'Recognition sent\',\'A note was shared with the team.\')">Send recognition →</button></div></div>') +
          savedReportsPanel('Saved reports', 'Team-scoped, ready to run or schedule',
            [['Team readiness snapshot', 'Updated ' + today() + ' · PDF'],
             ['Skills met by report', 'Updated 18 May · XLSX'],
             ['Intervention log', 'Updated 14 May · CSV']]) +
        '</div>'
    };
  }

  /* ---- Candidate: personal record --------------------------------------- */
  function reportsCandidate() {
    return {
      eyebrow: 'My record · Aarav Mehta',
      title: 'My reports',
      lede: 'Your current cycle, previous outcomes and exactly how the final report card is calculated.',
      actions: [['Download my record', "toast('Download queued','Your report card history (PDF) is being prepared.')"],
        ['Open report card', "go('assessment')", true]],
      summary:
        summaryCard('check', 'Skills met', '2 of 5', 'Python, SQL and visualization') +
        summaryCard('clock', 'Learning time', '7h 45m', 'across 3 providers') +
        summaryCard('target', 'Cycle progress', 'Day 26', 'of a 90-day window') +
        summaryCard('trend', 'Previous outcomes', '2 Success', 'no retakes needed'),
      body:
        '<div class="dashboard-grid wide-left">' +
          panel('My current cycle', 'Data Analytics · Senior Associate · benchmark v3.2',
            '<div class="row-list"><div class="content-head"><span>Skill</span><span>Assessed</span><span>Progress</span><span>Status</span><span></span></div>' +
            CAND_SKILLS.map((s) =>
              '<div class="content-row"><div><strong>' + s.name + '</strong><span>Target ' + s.target +
              (s.assessed ? ' · assessed ' + s.assessed : ' · not yet assessed') + '</span></div>' +
              '<span>' + (s.assessed || '—') + '</span>' +
              '<div class="row-progress"><div class="progress-track ' + (s.status === 'Met' ? '' : 'coral') + '"><span style="width:' +
              (s.status === 'Met' ? 100 : s.status === 'Learning' ? 55 : 0) + '%"></span></div></div>' +
              '<span class="status ' + (s.status === 'Met' ? 'on-track' : s.status === 'Learning' ? 'behind' : 'completed') + '">' + s.status + '</span>' +
              '<span></span></div>').join('') + '</div>',
            { toolbar: '<span class="tag teal">2 of 5 met</span>' }) +
          panel('How my report card is calculated', 'Applied when every skill is Met or the window closes',
            '<div class="panel-body pad-top">' +
            [['check', 'Skill coverage', 'Each skill is compared with its benchmark target — Met or open.'],
             ['clock', 'Timeline', 'Skills closed inside the 90-day window count as on time.'],
             ['target', 'Retries', 'Re-assessment attempts are recorded; more than two flags a development conversation.'],
             ['trend', 'Verdict', 'Success when every skill is Met · Partial when most are · Fail when the majority remain open.']]
              .map(([i, t, d]) => '<div class="fact-row"><span style="display:flex;gap:9px;align-items:flex-start">' +
                '<span class="metric-icon neutral" style="width:24px;height:24px">' + icon(i, 13) + '</span>' +
                '<span><strong style="font-family:var(--sans);font-size:12px;color:var(--ink)">' + t + '</strong>' +
                '<div style="font-size:10.5px;color:var(--muted-2);margin-top:2px">' + d + '</div></span></span></div>').join('') +
            '<div class="insight" style="margin:12px 0 0">' + icon('spark', 15) +
            '<p>Your manager sees the verdict, skills met, retries and time taken — not your raw assessment responses.</p></div></div>') +
        '</div>' +
        '<div class="dashboard-grid">' +
          reportCardsPanel('My history', 'Previous report cards issued to you',
            [['Aarav Mehta', 'AM', 'peach', 'Data Analytics · Associate v2.4', 'Success', '8 of 8 skills met', '12 Nov 2024'],
             ['Aarav Mehta', 'AM', 'peach', 'SQL deep-dive', 'Success', '3 of 3 skills met', '04 Mar 2024'],
             ['Aarav Mehta', 'AM', 'peach', 'Data Analytics · Associate v2.3', 'Partial', '6 of 8 skills met', '21 Sep 2023']]) +
          panel('Upcoming reports', 'What lands in your record next',
            [['Quarterly check-in summary', 'After your 1:1 with Vikram Shah · 28 May', '28 May'],
             ['Cycle report card (draft)', 'Finalises when all skills are Met or on 18 Aug', '18 Aug'],
             ['Annual competency statement', 'Rolls up every cycle into one record', 'Dec']].map(([t, s, w]) =>
              '<div class="report-row"><div class="report-icon">' + icon('calendar', 15) + '</div>' +
              '<div><strong>' + t + '</strong><span>' + s + '</span></div><span class="tag">' + w + '</span></div>').join('')) +
        '</div>'
    };
  }

  function renderReports() {
    const view = { ld: reportsLD, leader: reportsLeader, manager: reportsManager, candidate: reportsCandidate }[state.persona]();
    $('#reportsEyebrow').textContent = view.eyebrow;
    $('#reportsTitle').textContent = view.title;
    $('#reportsLede').textContent = view.lede;
    $('#reportsActions').innerHTML = view.actions.map(([label, action, primary]) =>
      '<button class="button' + (primary ? ' button-primary' : '') + '" onclick="' + action + '">' + label + '</button>').join('');
    $('#reportsBody').innerHTML = '<div class="module-summary four">' + view.summary + '</div>' + view.body;
    updateReportsNav();
  }

  /* ---------------------------------------------------------- content view */
  function renderContent() {
    $('#contentSummary').innerHTML =
      summaryCard('book', 'Resources', '386', '214 internal · 172 public') +
      summaryCard('layers', 'Mapped skills', '128', 'Across 12 competencies') +
      summaryCard('check', 'Healthy links', '363', 'Validated in last 30 days') +
      summaryCard('clock', 'Need review', '23', '8 broken · 15 outdated', 'warm');

    const h = $('#contentHealthFilter').value, t = $('#contentTypeFilter').value, q = state.query.toLowerCase();
    const rows = CONTENT.filter((c) =>
      (h === 'all' || c.health === h) && (t === 'all' || c.type === t) &&
      (!q || c.title.toLowerCase().includes(q) || c.skill.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q)));

    $('#resourceGrid').innerHTML = rows.length ? rows.map((c) =>
      '<article class="resource-card"><div class="resource-top">' +
        '<div class="report-icon">' + icon('book', 15) + '</div>' +
        '<span class="status ' + healthClass(c.health) + '">' + c.health + '</span></div>' +
      '<strong>' + c.title + '</strong><span>' + c.skill + ' · ' + c.level + '</span>' +
      '<div class="resource-tags"><span class="tag">' + c.provider + '</span><span class="tag blue">' + c.type + '</span>' +
        '<span class="tag">' + c.mapped + ' plan refs</span></div>' +
      '<div class="resource-foot"><span>' + c.learners.toLocaleString('en-GB') + ' learners</span>' +
        '<button class="text-button" onclick="toast(\'Content mapped\',\'' + c.title + ' mapped to ' + c.skill + ' at ' + c.level + ' level.\')">Map ' + icon('arrow', 12) + '</button></div></article>').join('')
      : '<div class="empty-state">No content matches “' + esc(state.query || h) + '”.</div>';

    $('#contentHealthRows').innerHTML =
      '<div class="content-head"><span>Resource</span><span>Type</span><span>Skill</span><span>Last checked</span><span>State</span></div>' +
      CONTENT.slice(0, 7).map((c) =>
        '<div class="content-row"><div><strong>' + c.title + '</strong><span>' + c.provider + ' · ' + c.level + '</span></div>' +
        '<span>' + c.type + '</span><span>' + c.skill + '</span><span>' + c.validated + '</span>' +
        '<span class="status ' + healthClass(c.health) + '">' + c.health + '</span></div>').join('');

    const cov = [['Python', 78], ['SQL', 71], ['Data visualization', 64], ['Statistical analysis', 58], ['Data storytelling', 52], ['Streaming architectures', 34]];
    $('#coverageBars').innerHTML = barRows(cov, '%');
  }

  /* ------------------------------------------------------- assessment lab */
  const lab = { theta: 0, se: 1, n: 0, used: [], current: null, assessed: null, plan: [], loop: 0, step: 1, events: [] };

  function labLog(msg) {
    lab.events.unshift(msg);
    const box = $('#labLog');
    if (box) {
      box.innerHTML = lab.events.slice(0, 7).map((e, i) =>
        '<div class="fact-row"><span class="mono" style="font-size:10.5px;color:' + (i === 0 ? 'var(--teal)' : 'var(--muted-2)') + '">' + esc(e) + '</span></div>').join('');
    }
  }

  function labJourney() {
    const steps = [
      ['Initial assessment', 'Adaptive IRT', lab.step > 1 ? 'complete' : 'active'],
      ['Gap analysis', lab.assessed ? (lab.assessed === 'Advanced' || lab.assessed === 'Expert' ? 'Target met' : 'Gap identified') : 'Pending', lab.step > 2 ? 'complete' : ''],
      ['Learning plan', lab.plan.length ? (lab.plan.filter((p) => p.done).length + ' of ' + lab.plan.length + ' done') : 'Not created', lab.step === 3 ? 'active' : (lab.step > 3 ? 'complete' : '')],
      ['Re-assessment', lab.loop ? (lab.loop + ' attempt(s)') : 'After a section', lab.step === 4 ? 'active' : (lab.step > 4 ? 'complete' : '')],
      ['Report card', lab.reported ? 'Generated' : 'Final outcome', lab.step === 5 ? 'active' : '']
    ];
    $('#labJourney').innerHTML = '<div class="journey-title"><span>Current journey</span><strong>Aarav Mehta · Python</strong></div>' +
      '<div class="journey-steps">' + steps.map(([n, s, st], i) =>
        '<div class="journey-step ' + st + '"><div class="step-marker">' + (st === 'complete' ? icon('check', 13) : (i + 1)) + '</div>' +
        '<div><strong>' + n + '</strong><span>' + s + '</span></div><i></i></div>').join('') + '</div>';
  }

  function paintTheta() {
    const pos = Math.max(2, Math.min(98, ((lab.theta + 3) / 6) * 100));
    const mark = $('#labThetaMark');
    mark.style.left = pos + '%';
    mark.dataset.lbl = 'θ ' + lab.theta.toFixed(2) + ' · ' + levelFromTheta(lab.theta);
    const w = Math.min(60, (lab.se * 2 / 6) * 100);
    const ci = $('#labThetaCi');
    ci.style.left = Math.max(0, pos - w / 2) + '%';
    ci.style.width = w + '%';
    $('#labSe').textContent = lab.n ? lab.se.toFixed(2) : '—';
    $('#labItems').textContent = String(lab.n);
    $('#labLevel').textContent = lab.assessed || '—';
  }
  const levelFromTheta = (t) => (t < -1 ? 'Beginner' : t < 0.05 ? 'Intermediate' : t < 1.1 ? 'Advanced' : 'Expert');
  const seFromN = (n) => (n === 0 ? 1 : 1 / Math.sqrt(1.9 * n + 0.5));

  function renderLabSkills() {
    $('#labSkills').innerHTML = CAND_SKILLS.map((s) =>
      '<div class="fact-row"><span>' + s.name + '<br><em style="font-style:normal;font-size:10px;color:var(--muted-2)">Target ' + s.target + '</em></span>' +
      '<span class="status ' + (s.status === 'Met' ? 'on-track' : s.status === 'Learning' ? 'behind' : 'completed') + '">' + (s.assessed || s.status) + '</span></div>').join('');
  }

  function labIntro() {
    $('#labItemCounter').textContent = 'Not started';
    $('#labAssessment').innerHTML =
      '<div class="panel-body" style="padding-top:0">' +
      '<div class="assessment-hero" style="margin:0 -20px 0;border-radius:0">' + icon('spark', 22) +
      '<span>Up next</span><h2>Adaptive assessment · Python</h2>' +
      '<p>Item difficulty is re-selected after every response using item response theory. The engine stops as soon as the standard error of the ability estimate falls below 0.30.</p></div>' +
      '<div class="assessment-facts" style="margin:0 -20px">' +
        '<div><span>Max items</span><strong>6</strong></div><div><span>SE target</span><strong>0.30</strong></div><div><span>Est. time</span><strong>6 min</strong></div></div>' +
      '<div class="button-row" style="margin-top:14px"><button class="button button-teal" onclick="startLab()">' + icon('play', 14) + ' Start assessment</button>' +
      '<span style="font-size:11px;color:var(--muted-2)">Item bank: 184 calibrated items · IRT 2PL</span></div></div>';
  }

  window.startLab = function () {
    lab.theta = 0; lab.se = 1; lab.n = 0; lab.used = []; lab.assessed = null; lab.step = 1; lab.events = [];
    labLog('assessment.started · user=aarav skill=Python');
    askLab();
  };

  function askLab() {
    const pool = QUESTIONS.map((q, i) => ({ q: q, i: i })).filter((x) => lab.used.indexOf(x.i) === -1)
      .sort((a, b) => Math.abs(a.q.b - lab.theta) - Math.abs(b.q.b - lab.theta));
    if (!pool.length) return finishLab();
    const pick = pool[0];
    lab.current = pick;
    lab.used.push(pick.i);
    const q = pick.q;
    $('#labItemCounter').textContent = 'Item ' + (lab.n + 1) + ' of 6';
    $('#labAssessment').innerHTML =
      '<div class="question-card"><div class="panel-body">' +
      '<div class="toolbar" style="margin-bottom:12px"><span class="tag teal">' + q.skill + '</span><span class="tag">' + q.type + '</span>' +
      '<span class="tag blue">difficulty b = ' + q.b.toFixed(2) + '</span>' +
      '<span class="tag">selected for maximum information at θ = ' + lab.theta.toFixed(2) + '</span></div>' +
      '<div style="font-family:var(--display);font-size:15px;font-weight:600;color:var(--ink);margin-bottom:14px">' + q.text + '</div>' +
      q.opts.map((o, i) => '<button class="option" data-i="' + i + '"><span class="key">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>').join('') +
      '<div id="labFeedback" style="font-size:11.5px;color:var(--muted);margin-top:8px">Select the best answer.</div>' +
      '</div></div>';
    $$('#labAssessment .option').forEach((b) => b.addEventListener('click', () => answerLab(Number(b.dataset.i))));
    labJourney();
  }

  function answerLab(choice) {
    const q = lab.current.q;
    const correct = choice === q.a;
    $$('#labAssessment .option').forEach((b) => {
      b.disabled = true;
      const i = Number(b.dataset.i);
      if (i === q.a) b.classList.add('correct');
      else if (i === choice) b.classList.add('wrong');
    });
    const p = 1 / (1 + Math.exp(-(lab.theta - q.b)));
    const K = 1.6 / (1 + 0.35 * (lab.n + 1));
    lab.theta = Math.max(-3, Math.min(3, lab.theta + K * ((correct ? 1 : 0) - p)));
    lab.n += 1;
    lab.se = seFromN(lab.n);
    labLog('item.answered · b=' + q.b.toFixed(2) + ' correct=' + correct + ' θ=' + lab.theta.toFixed(2) + ' SE=' + lab.se.toFixed(2));
    paintTheta();
    $('#labFeedback').innerHTML = (correct ? '<strong style="color:var(--teal)">✓ Correct.</strong> ' : '<strong style="color:var(--coral-deep)">✕ Not quite.</strong> ') +
      q.why + ' <strong>θ updated to ' + lab.theta.toFixed(2) + ' (SE ' + lab.se.toFixed(2) + ').</strong>';
    setTimeout(() => { if (lab.se <= 0.30 || lab.n >= 6) finishLab(); else askLab(); }, 1500);
  }

  function finishLab() {
    lab.assessed = levelFromTheta(lab.theta);
    lab.step = 2;
    $('#labItemCounter').textContent = 'Complete';
    $('#labAssessment').innerHTML =
      '<div class="panel-body">' +
      '<div class="insight" style="margin:0 0 14px">' + icon('check', 16) + '<p><strong>Assessment complete.</strong> Assessed level for Python: <strong>' + lab.assessed +
      '</strong> (θ = ' + lab.theta.toFixed(2) + ', SE = ' + lab.se.toFixed(2) + ', ' + lab.n + ' items, ' + Math.max(1, lab.n * 55) + 's). ' +
      '<span class="mono">assessment.completed</span> emitted.</p></div>' +
      '<div class="button-row"><button class="button button-sm" onclick="resetLab()">Retake assessment</button>' +
      '<button class="button button-sm" onclick="toast(\'Item telemetry\',\'Response times and correctness were written to the calibration set.\')">View item telemetry</button></div></div>';
    labLog('assessment.completed · level=' + lab.assessed);
    labJourney();

    const targetIdx = 3; // Advanced for Senior Associate
    const have = LEVELS.indexOf(lab.assessed) + 1;
    const gap = Math.max(0, targetIdx - have);
    $('#labGap').style.display = 'block';
    $('#labGapTag').textContent = gap ? gap + ' level gap' : 'No gap';
    $('#labGapTag').className = 'tag ' + (gap ? 'coral' : 'teal');
    const bar = (lbl, lv, colour) =>
      '<div class="gap-line"><span class="lbl">' + lbl + '</span><div class="tr"><div class="fl" style="width:' + (lv / 4 * 100) + '%;background:' + colour + '"></div></div><span class="val">' + level(lv) + '</span></div>';
    $('#labGapBody').innerHTML = bar('Assessed', have, 'linear-gradient(90deg,#35a58f,#147e6f)') + bar('Required', targetIdx, 'linear-gradient(90deg,#f0a48d,#e8785d)') +
      (gap ? '<div class="insight" style="margin:14px 0 0">' + icon('spark', 16) + '<p>Required improvement: move Python from <strong>' + lab.assessed + '</strong> to <strong>Advanced</strong>. A time-bound plan was generated from mapped internal and public content.</p></div>'
           : '<div class="insight" style="margin:14px 0 0">' + icon('check', 16) + '<p>No learning plan required — Python already meets the benchmark target and is recorded as <strong>Met</strong>.</p></div>');

    if (gap) buildLabPlan(); else { lab.step = 5; generateReportCard(false); }
    toast('Assessment complete', 'Assessed ' + lab.assessed + ' for Python · gap analysis generated');
  }

  function buildLabPlan() {
    lab.plan = [
      { title: 'Working with pandas', source: 'Internal academy · 3h 20m · SCORM', done: true },
      { title: 'Applied data analysis', source: 'Coursera · 2h 10m · URL', done: true },
      { title: 'Advanced pandas & performance', source: 'Coursera · 2h 45m · URL', done: false },
      { title: 'Statistical modelling', source: 'Internal lab · 1h 45m · LTI', done: false }
    ];
    lab.step = 3;
    $('#labPlan').style.display = 'block';
    renderLabPlan();
  }

  function renderLabPlan() {
    const done = lab.plan.filter((p) => p.done).length;
    $('#labPlanTag').textContent = done + ' / ' + lab.plan.length + ' complete';
    $('#labPlanBar').style.width = Math.round((done / lab.plan.length) * 100) + '%';
    $('#labPlanRows').innerHTML = lab.plan.map((p, i) =>
      '<div class="plan-row ' + (p.done ? 'done' : 'active') + '">' +
        '<div class="plan-number">' + (p.done ? icon('check', 13) : (i + 1)) + '</div>' +
        '<div><strong>' + p.title + '</strong><span>' + p.source + '</span></div>' +
        '<em>' + (p.done ? 'Done' : 'In progress') + '</em>' +
        (p.done ? '' : '<button onclick="completePlanItem(' + i + ')">Mark complete ' + icon('arrow', 12) + '</button>') +
      '</div>').join('');
    $('#labReassessButton').disabled = done === 0;
    $('#labReassessButton').textContent = done === 0 ? 'Take re-assessment (unlocks when a section is complete)'
      : (done === lab.plan.length ? 'Take final re-assessment (all sections complete)' : 'Take re-assessment for Python');
  }

  window.completePlanItem = function (i) {
    if (!lab.plan[i]) return;
    lab.plan[i].done = true;
    labLog('plan.item.completed · ' + lab.plan[i].title);
    renderLabPlan();
    lab.step = 4;
    labJourney();
    toast('Section marked complete', 'reassessment.triggered · a short adaptive quiz on the Python gap is ready');
    pushNotification('candidate', {
      type: 'assess', title: 'Re-assessment unlocked',
      body: lab.plan[i].title + ' is complete — the Python re-assessment is ready to take.',
      action: { label: 'Start re-assessment', onclick: "go('assessment')" }
    });
    pushNotification('manager', {
      type: 'team', title: 'Aarav Mehta completed a section',
      body: lab.plan[i].title + ' · next checkpoint is the Python re-assessment.',
      action: { label: 'View Aarav', onclick: "openPerson('aarav')" }
    });
  };

  window.runLabReassessment = function () {
    const q = QUESTIONS[4];
    const box = $('#labReassessBox');
    if (box) box.remove();
    const el = document.createElement('div');
    el.id = 'labReassessBox';
    el.className = 'question-card';
    el.innerHTML = '<div class="panel-body">' +
      '<div class="toolbar" style="margin-bottom:12px"><span class="tag teal">Re-assessment · short form</span><span class="tag">' + q.skill + '</span><span class="tag coral">gap area</span></div>' +
      '<div style="font-family:var(--display);font-size:15px;font-weight:600;margin-bottom:14px">' + q.text + '</div>' +
      q.opts.map((o, i) => '<button class="option" data-i="' + i + '"><span class="key">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>').join('') +
      '</div>';
    $('#labPlan').appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $$('#labReassessBox .option').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      $$('#labReassessBox .option').forEach((x) => {
        x.disabled = true;
        const j = Number(x.dataset.i);
        if (j === q.a) x.classList.add('correct');
        else if (j === i) x.classList.add('wrong');
      });
      submitReassessment(i === q.a, el);
    }));
  };

  function submitReassessment(correct, el) {
    if (correct) {
      labLog('reassessment.passed · Python → Met');
      lab.step = 5;
      labJourney();
      if (el) el.insertAdjacentHTML('beforeend', '<div class="insight" style="margin:14px 0 0">' + icon('check', 16) +
        '<p><strong>Re-assessment passed.</strong> Python is now Met at Advanced. <span class="mono">reassessment.passed</span> emitted.</p></div>');
      $('#labReassessButton').disabled = true;
      $('#labReassessButton').textContent = 'Re-assessment passed ✓';
      generateReportCard(false);
      toast('Skill met', 'Python verified at Advanced · report card preview updated');
      pushNotification('candidate', {
        type: 'card', title: 'Skill met: Python',
        body: 'Verified at Advanced against the benchmark target. Your report card preview was updated.',
        action: { label: 'Open my reports', onclick: "go('reports')" }
      });
      pushNotification('manager', {
        type: 'team', title: 'Aarav Mehta met a skill',
        body: 'Python verified at Advanced before the plan window closes.',
        action: { label: 'Open team reports', onclick: "go('reports')" }
      });
    } else {
      lab.loop += 1;
      labLog('reassessment.failed · remedial content inserted (attempt ' + (lab.loop + 1) + ')');
      lab.plan.push({ title: 'Remedial · Python performance clinic', source: 'Internal · 3h 00m · instructor-led', done: false });
      renderLabPlan();
      if (el) el.insertAdjacentHTML('beforeend', '<div class="insight" style="margin:14px 0 0;background:#fffaf8;color:var(--coral-deep)">' + icon('alert', 16) +
        '<p><strong style="color:var(--coral-deep)">Re-assessment failed.</strong> Remedial content was added to the plan and the loop continues — attempt ' + (lab.loop + 1) + ' is now available.</p></div>');
      toast('Re-assessment failed', 'Remedial content added · the learning loop continues');
      pushNotification('candidate', {
        type: 'reassess', title: 'Re-assessment failed: Python',
        body: 'Remedial content was added to your plan — attempt ' + (lab.loop + 1) + ' is now available.',
        action: { label: 'Continue learning', onclick: "go('assessment')" }
      });
      pushNotification('manager', {
        type: 'risk', title: 'Aarav Mehta needs support',
        body: 'Re-assessment failed on Python (attempt ' + lab.loop + ') — remedial content assigned automatically.',
        action: { label: 'View Aarav', onclick: "openPerson('aarav')" }
      });
    }
  };

  function generateReportCard(final) {
    const skills = [
      ['Python', 'Advanced', lab.assessed || 'Intermediate', lab.loop],
      ['SQL', 'Advanced', 'Advanced', 0],
      ['Data visualization', 'Intermediate', 'Advanced', 0],
      ['Statistical analysis', 'Intermediate', 'Intermediate', 0],
      ['Data storytelling', 'Advanced', '—', 0]
    ];
    const met = skills.filter((s) => s[2] !== '—' && LEVELS.indexOf(s[2]) >= LEVELS.indexOf(s[1])).length;
    const verdict = met >= 4 ? 'Success' : met >= 2 ? 'Partial' : 'Fail';
    const rows = skills.map(([n, t, a, r]) => {
      const ok = a !== '—' && LEVELS.indexOf(a) >= LEVELS.indexOf(t);
      return '<div class="content-row"><div><strong>' + n + '</strong><span>Target ' + t + '</span></div>' +
        '<span>' + a + '</span><span>' + r + ' retries</span>' +
        '<span class="status ' + (ok ? 'on-track' : 'behind') + '">' + (ok ? 'Met' : 'Open') + '</span><span></span></div>';
    }).join('');

    $('#labRepcard').innerHTML =
      '<div class="panel" style="margin-top:15px"><div class="assessment-hero">' +
      '<span>' + (final ? 'Final report card' : 'Report card · draft preview') + '</span>' +
      '<h2 style="margin-top:12px">' + verdict + '</h2>' +
      '<p>Aarav Mehta · Data Analytics · Senior Associate benchmark v3.2 · ' + (final ? 'finalised' : 'updated') + ' ' + today() + '</p></div>' +
      '<div class="assessment-facts"><div><span>Skills met</span><strong>' + met + ' / 5</strong></div>' +
      '<div><span>Re-assessment retries</span><strong>' + lab.loop + '</strong></div>' +
      '<div><span>Cycle time</span><strong>' + (final ? '71 d' : '26 d') + '</strong></div></div>' +
      '<div class="row-list"><div class="content-head"><span>Skill</span><span>Assessed</span><span>Retries</span><span>Outcome</span><span></span></div>' + rows + '</div>' +
      '<div class="panel-footer"><span style="font-size:11px;color:var(--muted)">' +
        (final ? 'Distributed to Vikram Shah (manager) and Ananya Rao (competency leader).' : 'Finalises when every skill is Met or the 90-day window expires.') + '</span>' +
      '<div class="button-row">' + (final ? '' : '<button class="button button-sm" onclick="finaliseCard()">Simulate timeline expiry</button>') +
      '<button class="button button-sm" onclick="toast(\'Export queued\',\'Report card PDF is being rendered.\')">Export PDF</button></div></div></div>';
    labJourney();
  }

  window.finaliseCard = function () {
    generateReportCard(true);
    toast('Report card finalised', 'Timeline expired · card distributed to the manager and competency leader');
  };

  window.resetLab = function () {
    lab.theta = 0; lab.se = 1; lab.n = 0; lab.used = []; lab.current = null; lab.assessed = null;
    lab.plan = []; lab.loop = 0; lab.step = 1; lab.events = []; lab.reported = false;
    $('#labGap').style.display = 'none';
    $('#labPlan').style.display = 'none';
    $('#labRepcard').innerHTML = '';
    $('#labReassessButton').disabled = true;
    $('#labReassessButton').textContent = 'Take re-assessment (unlocks when a section is complete)';
    const box = $('#labReassessBox'); if (box) box.remove();
    paintTheta();
    labIntro();
    labJourney();
    renderLabSkills();
    labLog('engine.ready · item bank loaded (184 items)');
  };

  /* ------------------------------------------------------------- blueprint */
  const MODULE_CARDS = [
    ['6.1 · Competency & benchmark management', ['CRUD for competencies, skills, roles and proficiency levels', 'Benchmark matrix builder with versioning', 'Taxonomy validation and new-skill requests', 'Assignment engine on publish']],
    ['6.2 · Adaptive assessment engine', ['Item bank with difficulty, discrimination and guessing parameters', 'IRT ability estimation and dynamic item selection', 'Confidence-interval and max-item termination', 'Initial and short-form re-assessment modes']],
    ['6.3 · Learning plan & content integration', ['Gap analysis: assessed score versus benchmark target', 'Content matching across internal and public sources', 'Time-bound plan generation with milestones', 'Self-reported completion via LTI, SCORM or URL tracking']],
    ['6.4 · Progress tracking & re-assessment', ['Skill state machine from Not Started to Met', 'Automatic re-assessment trigger on completion', 'Remedial content insertion on failure', 'Timeline expiry handling and cycle closure']],
    ['6.5 · Reporting & analytics', ['Candidate report cards with PDF and JSON export', 'Manager and competency-leader dashboards', 'Bottleneck skills, pass rates and time-to-close', 'Scheduled email distribution']],
    ['6.6 · Notification & communication', ['Event-driven triggers across the whole lifecycle', 'Email, in-app, Slack and Teams channels', 'Manager and leader nudges to candidates', 'Escalation on overdue plans']],
    ['6.7 · User & role management', ['SSO via SAML, OAuth 2.0 and OpenID Connect', 'RBAC for the four personas', 'Profile with competency, role, manager and history', 'SCIM sync from the HR system']]
  ];
  const INTEGRATIONS = [
    ['SSO', 'Authentication and session issuance', 'SAML 2.0 · OAuth 2.0 · OIDC'],
    ['HR system', 'User, role, manager and competency sync', 'REST API · SCIM 2.0'],
    ['Internal LMS', 'Training content, launch and completion signals', 'LTI 1.3 · SCORM · xAPI'],
    ['Public training', 'Course references and deep links', 'URL · provider REST APIs'],
    ['Notification', 'Email, chat and in-app delivery', 'SendGrid · Slack · Teams'],
    ['Analytics', 'Warehouse export and event streaming', 'REST · Webhooks · Data lake']
  ];
  const ENTITIES = [
    ['Competency', 'taxonomy', [['id', 'uuid', 'PK'], ['name', 'text', ''], ['description', 'text', '']]],
    ['Skill', 'taxonomy', [['id', 'uuid', 'PK'], ['competency_id', 'uuid', 'FK'], ['name', 'text', ''], ['type', 'enum', 'Technical / Business']]],
    ['Role', 'taxonomy', [['id', 'uuid', 'PK'], ['name', 'text', ''], ['level', 'int', '']]],
    ['ProficiencyLevel', 'taxonomy', [['id', 'uuid', 'PK'], ['name', 'text', ''], ['rank', 'int', '1–4']]],
    ['Benchmark', 'definition', [['id', 'uuid', 'PK'], ['competency_id', 'uuid', 'FK'], ['role_id', 'uuid', 'FK'], ['created_by', 'uuid', 'FK'], ['version', 'int', ''], ['status', 'enum', 'Draft / Published']]],
    ['BenchmarkSkill', 'definition', [['id', 'uuid', 'PK'], ['benchmark_id', 'uuid', 'FK'], ['skill_id', 'uuid', 'FK'], ['target_proficiency_id', 'uuid', 'FK']]],
    ['User', 'people', [['id', 'uuid', 'PK'], ['name', 'text', ''], ['email', 'text', ''], ['role_id', 'uuid', 'FK'], ['competency_id', 'uuid', 'FK'], ['manager_id', 'uuid', 'FK']]],
    ['Question', 'assessment', [['id', 'uuid', 'PK'], ['skill_id', 'uuid', 'FK'], ['difficulty', 'float', 'IRT b'], ['type', 'enum', 'MCQ / Scenario / Coding'], ['content', 'jsonb', ''], ['irt_params', 'jsonb', 'a, b, c']]],
    ['Assessment', 'assessment', [['id', 'uuid', 'PK'], ['user_id', 'uuid', 'FK'], ['skill_id', 'uuid', 'FK'], ['type', 'enum', 'Initial / Re-assessment'], ['start_time', 'ts', ''], ['status', 'enum', '']]],
    ['AssessmentResponse', 'assessment', [['id', 'uuid', 'PK'], ['assessment_id', 'uuid', 'FK'], ['question_id', 'uuid', 'FK'], ['response', 'jsonb', ''], ['time_taken', 'int', 'seconds'], ['correct', 'bool', '']]],
    ['LearningPlan', 'learning', [['id', 'uuid', 'PK'], ['user_id', 'uuid', 'FK'], ['skill_id', 'uuid', 'FK'], ['start_date', 'date', ''], ['end_date', 'date', ''], ['status', 'enum', '']]],
    ['LearningPlanItem', 'learning', [['id', 'uuid', 'PK'], ['plan_id', 'uuid', 'FK'], ['content_id', 'uuid', 'FK'], ['type', 'enum', 'Internal / Public'], ['url', 'text', ''], ['status', 'enum', 'Not Started / Complete']]],
    ['Content', 'learning', [['id', 'uuid', 'PK'], ['skill_id', 'uuid', 'FK'], ['title', 'text', ''], ['provider', 'text', ''], ['url', 'text', ''], ['type', 'enum', 'LTI / SCORM / URL']]],
    ['ReportCard', 'reporting', [['id', 'uuid', 'PK'], ['user_id', 'uuid', 'FK'], ['benchmark_id', 'uuid', 'FK'], ['generated_date', 'ts', ''], ['overall_status', 'enum', 'Success / Partial / Fail'], ['details', 'jsonb', '']]],
    ['Notification', 'reporting', [['id', 'uuid', 'PK'], ['user_id', 'uuid', 'FK'], ['type', 'enum', ''], ['message', 'text', ''], ['read_status', 'bool', ''], ['created_at', 'ts', '']]]
  ];
  const RELATIONS = [
    ['Competency', '1 ─ many', 'Skill', 'One competency contains many skills'],
    ['Benchmark', '1 ─ many', 'BenchmarkSkill', 'A matrix holds many skills with target proficiency'],
    ['User', '1 ─ many', 'Assessment', 'One assessment per user, skill and attempt'],
    ['LearningPlan', '1 ─ many', 'LearningPlanItem', 'A plan contains internal and public content items'],
    ['ReportCard', '1 ─ 1', 'Benchmark · User', 'One card summarises a user against a benchmark version'],
    ['User', '1 ─ many', 'Notification', 'Lifecycle events delivered to the affected user']
  ];
  const DESIGN_NOTES = [
    '<b>Versioned benchmarks</b> — version plus status (Draft / Published / Superseded). Re-publishing never mutates an in-flight plan unless explicitly re-assigned.',
    '<b>Skill state machine</b> — Not Started → Assessed → Learning → Re-Assessed → Met, with In Progress as the transient state while sections are worked.',
    '<b>Assessment typing</b> — one row per user / skill / attempt with type Initial or Re-Assessment, plus response-level telemetry for IRT recalibration.',
    '<b>Content is referenced, never stored</b> — Content.url plus provider metadata; completion lives on LearningPlanItem.',
    '<b>Auditability</b> — every benchmark edit, response and report-card write is journalled with actor and timestamp.'
  ];
  const INDEXES = [
    ['User(competency_id, role_id)', 'assignment fan-out on publish'],
    ['Question(skill_id, difficulty, irt_params)', 'sub-200 ms item selection'],
    ['LearningPlanItem(plan_id, status)', 'completion events, overdue detection'],
    ['AssessmentResponse(assessment_id)', 'IRT recalibration job'],
    ['ReportCard(benchmark_id, user_id)', 'manager and leader roll-ups']
  ];
  const FLOWS = [
    ['9.1 · Benchmark definition & assignment', 'Competency leader → taxonomy validation → automatic fan-out', [
      ['Step 1', 'Leader selects competency and role.', 'Actor: competency leader'],
      ['Step 2', 'Defines required skills and target proficiency per skill.', 'Writes BenchmarkSkill rows'],
      ['Step 3', 'System validates every skill against the taxonomy.', 'Unknown skill → request addition'],
      ['Step 4', 'Leader saves and publishes as a new version.', 'Draft → Published'],
      ['Step 5', 'Assignment engine matches all users by role and competency.', 'Emits benchmark.published'],
      ['Step 6', 'Candidates are notified; initial assessment becomes due.', 'Email · in-app · Teams']
    ]],
    ['9.2 · Adaptive assessment cycle', 'IRT-driven item selection until the confidence interval is narrow enough', [
      ['Step 1', 'Candidate starts the assessment for a skill.', 'Session cached in Redis'],
      ['Step 2', 'Engine seeds the ability estimate from prior history.', 'θ₀ prior'],
      ['Step 3', 'Candidate responds; θ is updated using the IRT model.', 'Response telemetry stored'],
      ['Step 4', 'Confidence reached? If not, pick the most informative item.', 'SE threshold or max items'],
      ['Step 5', 'Assessment ends; a proficiency level is emitted per skill.', 'Emits assessment.completed']
    ]],
    ['9.3 · Learning plan execution & re-assessment', 'Loops until every skill is Met or the plan window expires', [
      ['Step 1', 'Compare assessed level with the benchmark target.', 'Gap analysis'],
      ['Step 2', 'Query the content service for mapped training.', 'Internal + public'],
      ['Step 3', 'Generate a time-bound plan and notify the candidate.', 'Milestones and due dates'],
      ['Step 4', 'Candidate studies externally and marks sections complete.', 'Self-reported'],
      ['Step 5', 'Short adaptive re-assessment is triggered automatically.', 'Gap-focused items'],
      ['Step 6', 'Pass → Met. Fail → remedial content, loop continues.', 'plan.item.completed']
    ]],
    ['9.4 · Report card generation & distribution', 'Aggregates the whole history into one verdict', [
      ['Trigger', 'All skills Met, or the overall timeline expires.', 'benchmark.cycle.closed'],
      ['Step 2', 'Aggregate initial scores, retries and time taken.', 'From assessment history'],
      ['Step 3', 'Compare final proficiency against every target.', 'Per-skill delta'],
      ['Step 4', 'Determine overall status: Success, Partial or Fail.', 'Policy thresholds'],
      ['Step 5', 'Render PDF / JSON and push to manager and leader.', 'Stored + emailed'],
      ['Step 6', 'Update profile, dashboards and L&D analytics.', 'Emits reportcard.ready']
    ]]
  ];
  const LOOP = [
    ['Gap analysis', 'Assessed level compared with the benchmark target for each skill.'],
    ['Content matching', 'The content service returns internal and public trainings mapped to the skill.'],
    ['Plan generation', 'A time-bound plan with milestones and due dates is created and notified.'],
    ['Study & self-report', 'Candidate studies externally, then marks plan sections complete.'],
    ['Re-assessment', 'A short adaptive quiz focused on the gap areas is triggered automatically.'],
    ['Verdict', 'Pass → skill marked Met. Fail → remedial content is inserted into the plan.'],
    ['Progress tracking', 'Skill state, timeline health and nudges update continuously.'],
    ['Exit condition', 'All skills Met, or the overall timeline expires → report card.']
  ];
  const NFRS = [
    ['Scalability', 'layers', 'Tens of thousands of users with concurrent adaptive assessments on horizontally scaled stateless services.'],
    ['Performance', 'trend', 'Adaptive question selection under 200 ms; dashboard loads under 2 s at p95.'],
    ['Security', 'target', 'RBAC on every endpoint, encryption in transit and at rest, GDPR / CCPA-compliant handling of assessment data.'],
    ['Availability', 'clock', '99.9% uptime target with multi-zone deployment and tested disaster recovery.'],
    ['Usability', 'spark', 'Intuitive, mobile-responsive workspace for all four personas, accessible by default.'],
    ['Auditability', 'file', 'Immutable trail of benchmark changes, assessment responses and generated report cards.'],
    ['Extensibility', 'grid', 'Plugin architecture for new question types, content providers and notification channels.']
  ];
  const ASSUMPTIONS = [
    'Candidates self-report completion of external learning sections; re-assessment verifies the learning landed.',
    'A sufficiently large, calibrated question bank exists per skill — IRT needs volume to be stable.',
    'HR system integration supplies authoritative user, role, manager and competency data.',
    'Managers and competency leaders act on the dashboards; nudges change behaviour.'
  ];
  const CONSTRAINTS = [
    'The platform never hosts training content — it references internal LMS items and public URLs.',
    'Public content may expose no completion tracking, so tracking relies on self-report plus re-assessment.',
    'Benchmark changes are not retroactive: in-flight plans continue on the version they were assigned.',
    'Adaptive accuracy degrades for skills with a thin or uncalibrated item bank.'
  ];
  const GLOSSARY = [
    ['IRT', 'Item Response Theory — the statistical framework behind adaptive testing.'],
    ['LTI', 'Learning Tools Interoperability — launches and tracks external learning tools.'],
    ['SCORM', 'Sharable Content Object Reference Model — legacy e-learning packaging standard.'],
    ['xAPI', 'Experience API — modern event-based learning tracking standard.'],
    ['RBAC', 'Role-Based Access Control derived from the four personas.'],
    ['SSO', 'Single Sign-On through the corporate identity provider.'],
    ['Gap analysis', 'Comparison of assessed skill level against the required benchmark target.'],
    ['Remedial content', 'Additional training assigned when a re-assessment fails.']
  ];
  const ROADMAP = [
    ['Phase 1', '0–3 months', 'Foundation', ['Taxonomy, roles and proficiency scales modelled', 'SSO plus HR/SCIM user synchronisation', 'Benchmark CRUD, validation and versioning', 'RBAC for the four personas']],
    ['Phase 2', '3–6 months', 'Assessment engine', ['Item bank authoring and calibration tooling', 'IRT ability estimation and adaptive selection', 'Initial assessment flow with scoring and telemetry', 'Assessment UI for web and mobile']],
    ['Phase 3', '6–9 months', 'Mastery loop', ['Gap analysis and plan generation', 'Content catalogue with LTI, SCORM and URL mapping', 'Re-assessment triggers and remedial branching', 'Event-driven notifications and nudges']],
    ['Phase 4', '9–12 months', 'Insight & scale', ['Manager, leader and L&D dashboards', 'Report card generation and distribution', 'Analytics warehouse with bottleneck and time-to-close reporting', 'AI-assisted plan recommendations and ROI modelling']]
  ];
  const OPEN_Q = [
    ['Taxonomy evolution', 'How are new skills introduced and deprecated ones retired without orphaning historical benchmarks?'],
    ['Performance integration', 'Should proficiency feed directly into performance management and continuous feedback?'],
    ['Human validation', 'Do some soft skills require peer or manager attestation alongside adaptive testing?'],
    ['Multi-competency employees', 'How is readiness blended when an employee holds benchmarks in two competencies?'],
    ['AI-generated plans', 'Can plans be auto-drafted and then validated by the L&D team?'],
    ['Failed candidates', 'Mandatory retraining, a performance plan, or manager discretion?'],
    ['Programme ROI', 'How do we correlate skill closure with project outcomes and utilisation?']
  ];
  const FUTURES = [
    ['AI', 'Auto-generated learning plans validated by L&D'],
    ['Signals', 'Peer and manager attestation for soft skills'],
    ['Multi', 'Concurrent benchmarks with a blended readiness score'],
    ['Value', 'ROI correlation with project outcomes'],
    ['HR', 'Performance-management integration for promotion panels']
  ];

  function renderBlueprint() {
    $('#moduleCards').innerHTML = MODULE_CARDS.map(([t, items]) =>
      '<div class="bp-card accent-teal"><h3>' + t + '</h3><ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul></div>').join('');
    $('#integrationCards').innerHTML = INTEGRATIONS.map(([t, p, s]) =>
      '<div class="bp-card"><h3>' + t + '</h3><p>' + p + '</p><div style="margin-top:8px"><span class="tag blue mono">' + s + '</span></div></div>').join('');

    $('#entityGrid').innerHTML = ENTITIES.map(([name, tag, fields]) =>
      '<div class="ent"><div class="ent-head">' + name + '<span class="ent-tag">' + tag + '</span></div>' +
      fields.map(([f, ty, note]) => {
        const cls = note === 'PK' ? ' pk' : (String(note).indexOf('FK') === 0 ? ' fk' : '');
        const key = note === 'PK' ? '<span class="fkey">PK</span>' : (String(note).indexOf('FK') === 0 ? '<span class="fkey">FK</span>' : '');
        return '<div class="ent-field' + cls + '"><span>' + f + '</span>' + key + '<span class="ftype">' + ty + '</span></div>';
      }).join('') + '</div>').join('');

    $('#relList').innerHTML = RELATIONS.map(([a, c, b, note]) =>
      '<div class="rel-row"><b>' + a + '</b><span class="arrow">' + c + '</span><b>' + b + '</b><span class="hint">' + note + '</span></div>').join('');
    $('#designNotes').innerHTML = DESIGN_NOTES.map((n) => '<li>' + n + '</li>').join('');
    $('#indexPatterns').innerHTML = INDEXES.map(([i, w]) =>
      '<div class="rel-row" style="font-size:11px"><span class="mono">' + i + '</span><span class="hint">' + w + '</span></div>').join('');

    $('#flowContainer').innerHTML = FLOWS.map(([title, sub, steps]) =>
      '<div class="panel" style="margin-bottom:15px"><div class="panel-header"><div><h2>' + title + '</h2><p>' + sub + '</p></div></div>' +
      '<div class="panel-body"><div class="flow">' + steps.map(([n, p, s], i) =>
        '<div class="flow-step ' + (i === steps.length - 1 && /reached|determine/i.test(p) ? 'decision' : (n === 'Step 3' || n === 'Trigger' ? 'system' : '')) + '">' +
        '<span class="fs-n">' + n + '</span><p>' + p + '</p><small>' + s + '</small></div>').join('') + '</div></div></div>').join('');
    $('#loopVis').innerHTML = LOOP.map(([t, p], i) =>
      '<div class="loop-node"><div class="ln-i">' + (i + 1) + '</div><h4>' + t + '</h4><p>' + p + '</p></div>').join('') +
      '<div class="loop-back">' + icon('arrow', 15) + '<span>On failure the loop returns to content matching with remedial material — bounded by the plan end date, with every iteration recorded on the report card.</span></div>';

    $('#nfrGrid').innerHTML = NFRS.map(([t, ico, d]) =>
      '<div class="bp-card accent-navy"><div class="metric-icon neutral" style="margin-bottom:10px">' + icon(ico, 16) + '</div><h3>' + t + '</h3><p>' + d + '</p></div>').join('');
    $('#assumptionList').innerHTML = ASSUMPTIONS.map((a) => '<li>' + a + '</li>').join('');
    $('#constraintList').innerHTML = CONSTRAINTS.map((a) => '<li>' + a + '</li>').join('');
    $('#glossaryGrid').innerHTML = GLOSSARY.map(([t, d]) => '<dl class="def"><dt>' + t + '</dt><dd>' + d + '</dd></dl>').join('');

    $('#roadmapTimeline').innerHTML = ROADMAP.map(([ph, when, title, items]) =>
      '<div class="tl-item"><div class="tl-phase">' + ph + '<div style="font-weight:400;color:var(--muted-2);font-size:10px">' + when + '</div></div>' +
      '<div class="tl-rail"><div class="tl-dot"></div></div>' +
      '<div class="tl-body"><h4>' + title + '</h4><ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul></div></div>').join('');
    $('#openQuestions').innerHTML = OPEN_Q.map(([t, d]) =>
      '<div class="rel-row"><span class="tag">?</span><div><b>' + t + '</b><div style="font-size:10.5px;color:var(--muted-2);margin-top:2px">' + d + '</div></div></div>').join('');
    $('#futureList').innerHTML = FUTURES.map(([tag, d]) =>
      '<div class="rel-row"><span class="tag teal">' + tag + '</span><span style="font-size:11.5px">' + d + '</span></div>').join('');

    $('#funnelBars').innerHTML = FUNNEL.map(([l, n, pct]) =>
      '<div class="funnel-row"><span>' + l + '</span><div class="funnel-bar" style="width:' + pct + '%">' + (pct > 22 ? n.toLocaleString('en-GB') : '') + '</div><span class="val">' + pct + '%</span></div>').join('');
    $('#bottleneckBars').innerHTML = barRows(BOTTLENECK.map(([n, p]) => [n, p]), '', 'linear-gradient(90deg,#e8785d,#d4553f)');
  }

  /* ---------------------------------------------------------------- drawer */
  function openDrawer(eyebrow, title, bodyHtml) {
    $('#drawerHead').innerHTML = '<button class="icon-button" onclick="closeDrawer()" aria-label="Close">' + icon('close', 15) + '</button>' +
      '<span class="eyebrow">' + eyebrow + '</span><h2>' + title + '</h2>';
    $('#drawerBody').innerHTML = bodyHtml;
    $('#drawer').classList.add('open');
    $('#drawer').setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('open');
  }
  window.closeDrawer = function () {
    $('#drawer').classList.remove('open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    $('#scrim').classList.remove('open');
  };
  $('#scrim').addEventListener('click', closeDrawer);
  const modalWrap = $('#modalWrap');
  if (modalWrap) modalWrap.addEventListener('click', (e) => { if (e.target === modalWrap) window.closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (notifPanelOpen()) { window.closeNotifications(); return; }
    if ($('#modalWrap') && $('#modalWrap').classList.contains('open')) { window.closeModal(); return; }
    closeDrawer();
    $('#sidebar').classList.remove('open');
  });

  /* --------------------------------------------------------------- routing */
  function go(view) {
    state.view = view;
    $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
    $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'competencies') renderCompetencies();
    if (view === 'people') renderPeople();
    if (view === 'reports') renderReports();
    if (view === 'content') renderContent();
    if (view === 'assessment') { if (!lab.events.length) resetLab(); labJourney(); }
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.go = go;

  /* ---------------------------------------------------------------- search */
  function onSearch(q) {
    state.query = q.trim();
    if (state.view === 'people') renderPeople();
    else if (state.view === 'competencies') renderCompetencies();
    else if (state.view === 'content') renderContent();
    else if (state.query.length >= 2) { go('people'); }
  }

  /* ------------------------------------------------------------------ boot */
  function today() {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon, el.dataset.size || 16); });
  $('#menuButton').innerHTML = icon('menu', 17);
  $('#todayDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  seedNotifications();
  updateNotifBadge();
  renderNotifPanel();
  personaSwitcher();
  renderOverview();
  renderBlueprint();
  resetLab();

  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    go(b.dataset.view);
    $('#sidebar').classList.remove('open');
  }));
  $('#menuButton').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#notifButton').addEventListener('click', (e) => { e.stopPropagation(); window.toggleNotifications(); });
  /* click anywhere else closes the notification panel */
  document.addEventListener('click', (e) => {
    const panel = $('#notifPanel'), button = $('#notifButton');
    if (!panel || !panel.classList.contains('open')) return;
    if (panel.contains && panel.contains(e.target)) return;
    if (button && button.contains && button.contains(e.target)) return;
    window.closeNotifications();
  });
  $('#globalSearch').addEventListener('input', (e) => onSearch(e.target.value));
  $('#compStatusFilter').addEventListener('change', renderCompetencies);
  $('#peopleCompFilter').addEventListener('change', renderPeople);
  $('#peopleStatusFilter').addEventListener('change', renderPeople);
  $('#contentHealthFilter').addEventListener('change', renderContent);
  $('#contentTypeFilter').addEventListener('change', renderContent);
  $('#labResetButton').addEventListener('click', resetLab);
  $('#labReassessButton').addEventListener('click', window.runLabReassessment);
  document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#globalSearch').focus(); } });

  go((location.hash || '#overview').slice(1));

  /* Debug/automation surface — drive the prototype from the console or a
     headless smoke test: CompetencyOS.go('people'), .setPersona('leader'),
     .lab.start(), .lab.answer(2), .lab.submit(true) ... */
  window.CompetencyOS = {
    go: go, setPersona: setPersona, search: onSearch,
    state: state, personas: PERSONAS, people: PEOPLE, competencies: COMPETENCIES, content: CONTENT,
    questions: QUESTIONS, planTemplate: PLAN,
    resetLab: resetLab,
    lab: {
      state: lab,
      start: function () { startLab(); },
      answer: function (i) { answerLab(i); },
      next: function () { askLab(); },
      finish: finishLab, buildPlan: buildLabPlan, completeItem: completePlanItem,
      reassess: function () { window.runLabReassessment(); },
      submit: function (correct) { submitReassessment(correct, null); },
      finalise: function () { window.finaliseCard(); }
    },
    openPerson: function (id) { window.openPerson(id); },
    openCompetency: function (code) { window.openCompetency(code); },
    taxonomy: TAXONOMY, skillRequests: SKILL_REQUESTS, roleAudience: ROLE_AUDIENCE,
    validation: {
      runChecks: runChecks,
      competency: function (code) {
        const c = COMPETENCIES.filter((x) => x.code === code)[0];
        const skills = benchmarkFor(c.name).map((r) => ({ name: r.skill, type: r.type, targets: r.targets.slice() }));
        return runChecks(c.name, skills, { published: benchmarkFor(c.name), status: c.status, assigned: c.assigned });
      },
      draft: function () { return runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role }); },
      report: function (scope) { if (scope) window.validateCompetency(scope); else window.validateAllTaxonomy(); }
    },
    benchmark: {
      state: draft, versionHistory: versionHistory, benchmarkFor: benchmarkFor, nextVersion: nextVersion,
      open: function (comp) { window.newBenchmarkFor(comp || 'Data Analytics'); },
      setField: function (f, v) { window.setDraftField(f, v); },
      step: function (n) { window.wizardStep(n); },
      setTarget: function (i, r, v) { window.setDraftTarget(i, r, v); },
      removeSkill: function (i) { window.removeDraftSkill(i); },
      addSkill: function (name, asCustom) {
        draft.skills.push({
          name: name,
          type: /storytelling|management|communication/i.test(name) ? 'Business' : 'Technical',
          targets: BASE_TARGETS.slice(),
          source: taxonomySkills(draft.competency).indexOf(name) === -1 ? 'custom' : 'taxonomy'
        });
        draft.checks = runChecks(draft.competency, draft.skills, { published: benchmarkFor(draft.competency), role: draft.role });
        renderWizard();
      },
      validate: function () { window.validateDraft(); },
      publish: function () { window.publishDraft(); },
      close: function () { window.closeModal(); }
    },
    notifications: {
      seed: NOTIFICATION_SEED,
      inbox: function (persona) { return state.notifs[persona || state.persona] || []; },
      unread: function (persona) { return unreadCount(persona); },
      toggle: function () { window.toggleNotifications(); },
      close: function () { window.closeNotifications(); },
      filter: function (f) { window.setNotifFilter(f); },
      open: function (id, run) { window.openNotification(id, run); },
      markAllRead: function () { window.markAllNotificationsRead(); },
      push: function (persona, n) { pushNotification(persona, n); }
    }
  };
})();
