const state = {
  priority: { results: null, processes: [] },
  srtf: { results: null, processes: [] }
};

const COLORS = ['#4f8ef7','#f75f4f','#4fd9a0','#f7b84f','#bf7af7','#f75fbf','#7af7f7','#f7e04f'];


function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active-a','active-b','active-c');
  });
  document.getElementById('page-' + name).classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  const classes = ['active-a','active-b','active-c'];
  const pages = ['priority','srtf','comparison'];
  tabs[pages.indexOf(name)].classList.add(classes[pages.indexOf(name)]);
  if (name === 'comparison') buildComparison();
}


let rowId = 0;
function addRow(type, data = {}) {
  const tbody = document.getElementById(type + '-tbody');
  const id = rowId++;
  const isPriority = type === 'priority';
  const tr = document.createElement('tr');
  tr.dataset.id = id;

  const pidVal = data.pid !== undefined ? data.pid : '';
  const arrVal = data.arr !== undefined ? data.arr : '';
  const burstVal = data.burst !== undefined ? data.burst : '';
  const priVal = data.priority !== undefined ? data.priority : '';

  tr.innerHTML = `
    <td><input type="text" placeholder="" value="${pidVal}" class="pid-input" data-row="${id}"></td>
    <td><input type="number" placeholder="" value="${arrVal}" class="arr-input" data-row="${id}" min="0"></td>
    <td><input type="number" placeholder="" value="${burstVal}" class="burst-input" data-row="${id}" min="1"></td>
    ${isPriority ? `<td><input type="number" placeholder="" value="${priVal}" class="pri-input" data-row="${id}" min="1"></td>` : ''}
    <td><button class="remove-btn" onclick="removeRow(this)"></button></td>
  `;
  tbody.appendChild(tr);
}

function removeRow(btn) {
  btn.closest('tr').remove();
}

function clearTable(type) {
  document.getElementById(type + '-tbody').innerHTML = '';
  document.getElementById(type + '-alerts').innerHTML = '';
  document.getElementById(type + '-gantt-container').innerHTML = '<div class="empty-state"><div class="empty-icon"></div>Run the scheduler to see the Gantt chart</div>';
  document.getElementById(type + '-metrics-container').innerHTML = '<div class="empty-state"><div class="empty-icon"></div>Metrics will appear after running</div>';
  const sc = document.getElementById(type + '-scenarios'); if (sc) sc.innerHTML = '<div class="no-data">Run scheduler to detect scenarios</div>';
  state[type].results = null;
}


const SCENARIOS = {
  priority: {
    A: [
      {pid:'P1', arr:0, burst:6, priority:2},
      {pid:'P2', arr:1, burst:4, priority:1},
      {pid:'P3', arr:2, burst:2, priority:3},
      {pid:'P4', arr:3, burst:5, priority:2},
    ],
    B: [
      {pid:'P1', arr:0, burst:10, priority:1},
      {pid:'P2', arr:1, burst:2, priority:4},
      {pid:'P3', arr:2, burst:3, priority:3},
      {pid:'P4', arr:3, burst:1, priority:2},
    ],
    C: [
      {pid:'P1', arr:0, burst:15, priority:5},
      {pid:'P2', arr:1, burst:3, priority:1},
      {pid:'P3', arr:2, burst:2, priority:1},
      {pid:'P4', arr:3, burst:4, priority:1},
    ],
    D: [
      {pid:'P1', arr:0, burst:4, priority:0},
      {pid:'P1', arr:2, burst:3, priority:2},
      {pid:'P3', arr:-1, burst:5, priority:1},
      {pid:'P4', arr:3, burst:6, priority:3},
    ]
  },
  srtf: {
    A: [
      {pid:'P1', arr:0, burst:6},
      {pid:'P2', arr:1, burst:4},
      {pid:'P3', arr:2, burst:2},
      {pid:'P4', arr:3, burst:5},
    ],
    B: [
      {pid:'P1', arr:0, burst:10},
      {pid:'P2', arr:1, burst:2},
      {pid:'P3', arr:2, burst:3},
      {pid:'P4', arr:3, burst:1},
    ],
    C: [
      {pid:'P1', arr:0, burst:15},
      {pid:'P2', arr:1, burst:3},
      {pid:'P3', arr:2, burst:2},
      {pid:'P4', arr:3, burst:4},
    ],
    D: [
      {pid:'P1', arr:0, burst:4},
      {pid:'P1', arr:2, burst:3},
      {pid:'P3', arr:-1, burst:5},
      {pid:'P4', arr:3, burst:6},
    ]
  }
};

function loadScenario(type, letter) {
  clearTable(type);
  const data = SCENARIOS[type][letter];
  data.forEach(d => addRow(type, d));
  if (letter === 'D') {
    showAlert(type, 'warn', '', 'Scenario D contains intentional invalid data (duplicate PID, negative arrival). Run to see validation in action.');
  }
}


function getRows(type) {
  const rows = [];
  document.querySelectorAll(`#${type}-tbody tr`).forEach(tr => {
    const pid = tr.querySelector('.pid-input').value.trim();
    const arr = tr.querySelector('.arr-input').value;
    const burst = tr.querySelector('.burst-input').value;
    const priEl = tr.querySelector('.pri-input');
    const pri = priEl ? priEl.value : null;
    rows.push({ tr, pid, arr, burst, pri });
  });
  return rows;
}

function validateRows(type, rows) {
  const errors = [];
  const pids = new Set();
  let valid = [];

  rows.forEach((r, i) => {
    const rowErrors = [];

    if (!r.pid) rowErrors.push('PID is required');
    else if (!/^[A-Za-z0-9_-]+$/.test(r.pid)) rowErrors.push(`Invalid PID "${r.pid}" — use alphanumeric only`);
    else if (pids.has(r.pid)) rowErrors.push(`Duplicate PID "${r.pid}" — PIDs must be unique`);
    else pids.add(r.pid);

    if (r.arr === '' || r.arr === null) rowErrors.push('Arrival time is required');
    else if (isNaN(Number(r.arr))) rowErrors.push('Arrival time must be a number');
    else if (Number(r.arr) < 0) rowErrors.push(`Arrival time cannot be negative (got ${r.arr}) — must be ≥ 0`);

    if (r.burst === '' || r.burst === null) rowErrors.push('Burst time is required');
    else if (isNaN(Number(r.burst))) rowErrors.push('Burst time must be a number');
    else if (Number(r.burst) <= 0) rowErrors.push(`Burst time must be > 0 (got ${r.burst}) — zero or negative not allowed`);
    else if (!Number.isInteger(Number(r.burst))) rowErrors.push('Burst time must be an integer');

    if (type === 'priority') {
      if (r.pri === '' || r.pri === null) rowErrors.push('Priority is required');
      else if (isNaN(Number(r.pri))) rowErrors.push('Priority must be a number');
      else if (Number(r.pri) < 1) rowErrors.push(`Priority must be ≥ 1 (got ${r.pri})`);
      else if (!Number.isInteger(Number(r.pri))) rowErrors.push('Priority must be an integer');
    }

    if (rowErrors.length === 0) {
      valid.push({
        pid: r.pid,
        arr: Number(r.arr),
        burst: Number(r.burst),
        priority: r.pri !== null ? Number(r.pri) : undefined
      });
    } else {
      rowErrors.forEach(e => errors.push(`Row ${i+1} [${r.pid || '?'}]: ${e}`));
    }
  });

  return { errors, valid };
}

function showAlert(type, kind, icon, msg) {
  const container = document.getElementById(type + '-alerts');
  const div = document.createElement('div');
  div.className = `alert alert-${kind}`;
  div.innerHTML = `<span class="alert-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(div);
}


function runPriorityScheduler(processes) {
  
  const procs = processes.map(p => ({...p, remaining: p.burst, ft: 0, started: false, startTime: -1}));
  const n = procs.length;
  const maxTime = procs.reduce((s, p) => s + p.burst, 0) + procs.reduce((mx, p) => Math.max(mx, p.arr), 0) + 1;

  let time = 0;
  let completed = 0;
  const gantt = []; 
  const tieEvents = [];
  let preemptEvents = [];

  while (completed < n && time < maxTime * 2) {
    const available = procs.filter(p => p.arr <= time && p.remaining > 0);
    if (available.length === 0) { time++; continue; }

    
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arr !== b.arr) { tieEvents.push({time, reason: 'same priority → earlier arrival wins'}); return a.arr - b.arr; }
      tieEvents.push({time, reason: 'same priority & arrival → lower PID wins'});
      return a.pid.localeCompare(b.pid);
    });

    const current = available[0];
    if (!current.started) { current.startTime = time; current.started = true; }

    
    let runUntil = time + 1;
    
    const nextArrival = procs.filter(p => p.arr > time && p.remaining > 0).map(p => p.arr).sort((a,b)=>a-b)[0];
    if (nextArrival !== undefined) runUntil = Math.min(runUntil, nextArrival);

    const lastGantt = gantt[gantt.length - 1];
    if (lastGantt && lastGantt.pid === current.pid && lastGantt.end === time) {
      lastGantt.end = runUntil;
    } else {
      if (lastGantt && lastGantt.pid !== current.pid) preemptEvents.push(time);
      const ci = procs.indexOf(current) % COLORS.length;
      gantt.push({pid: current.pid, start: time, end: runUntil, color: COLORS[ci]});
    }

    const ran = runUntil - time;
    current.remaining -= ran;
    time = runUntil;

    if (current.remaining === 0) {
      current.ft = time;
      completed++;
    }
  }

  
  const metrics = procs.map(p => {
    const tat = p.ft - p.arr;
    const wt = tat - p.burst;
    const rt = p.startTime - p.arr;
    return { pid: p.pid, arr: p.arr, burst: p.burst, priority: p.priority, ft: p.ft, tat, wt, rt };
  });

  return { gantt, metrics, tieEvents, preemptEvents };
}


function runSRTFScheduler(processes) {
  const procs = processes.map(p => ({...p, remaining: p.burst, ft: 0, started: false, startTime: -1}));
  const n = procs.length;
  const maxTime = procs.reduce((s, p) => s + p.burst, 0) + procs.reduce((mx, p) => Math.max(mx, p.arr), 0) + 5;

  let time = 0;
  let completed = 0;
  const gantt = [];
  const tieEvents = [];
  const preemptEvents = [];

  while (completed < n && time < maxTime) {
    const available = procs.filter(p => p.arr <= time && p.remaining > 0);
    if (available.length === 0) { time++; continue; }

    available.sort((a, b) => {
      if (a.remaining !== b.remaining) return a.remaining - b.remaining;
      if (a.arr !== b.arr) { tieEvents.push({time, reason: 'same remaining → earlier arrival wins'}); return a.arr - b.arr; }
      tieEvents.push({time, reason: 'same remaining & arrival → lower PID wins'});
      return a.pid.localeCompare(b.pid);
    });

    const current = available[0];
    if (!current.started) { current.startTime = time; current.started = true; }

    let runUntil = time + 1;
    const nextArrival = procs.filter(p => p.arr > time && p.remaining > 0).map(p => p.arr).sort((a,b)=>a-b)[0];
    if (nextArrival !== undefined) runUntil = Math.min(runUntil, nextArrival);

    
    if (current.remaining <= runUntil - time) {
      runUntil = time + current.remaining;
    }

    const lastGantt = gantt[gantt.length - 1];
    if (lastGantt && lastGantt.pid === current.pid && lastGantt.end === time) {
      lastGantt.end = runUntil;
    } else {
      if (lastGantt && lastGantt.pid !== current.pid) preemptEvents.push(time);
      const ci = procs.indexOf(current) % COLORS.length;
      gantt.push({pid: current.pid, start: time, end: runUntil, color: COLORS[ci]});
    }

    const ran = runUntil - time;
    current.remaining -= ran;
    time = runUntil;

    if (current.remaining === 0) {
      current.ft = time;
      completed++;
    }
  }

  const metrics = procs.map(p => {
    const tat = p.ft - p.arr;
    const wt = tat - p.burst;
    const rt = p.startTime - p.arr;
    return { pid: p.pid, arr: p.arr, burst: p.burst, ft: p.ft, tat, wt, rt };
  });

  return { gantt, metrics, tieEvents, preemptEvents };
}


function runScheduler(type) {
  document.getElementById(type + '-alerts').innerHTML = '';
  const rows = getRows(type);
  if (rows.length === 0) {
    showAlert(type, 'err', '', 'No processes entered. Please add at least one process.');
    return;
  }
  const { errors, valid } = validateRows(type, rows);

  if (errors.length > 0) {
    errors.forEach(e => showAlert(type, 'err', '', e));
    return;
  }
  if (valid.length < 1) {
    showAlert(type, 'err', '', 'No valid processes after validation.');
    return;
  }

  showAlert(type, 'ok', '', `Running ${type === 'priority' ? 'Priority' : 'SRTF'} scheduler with ${valid.length} processes...`);

  const result = type === 'priority' ? runPriorityScheduler(valid) : runSRTFScheduler(valid);
  state[type].results = result;
  state[type].processes = valid;

  renderGantt(type, result.gantt, valid, result.preemptEvents);
  renderMetrics(type, result.metrics, type === 'priority');
  detectScenarios(type, valid, result);
}


function renderGantt(type, gantt, processes, preemptEvents) {
  if (!gantt.length) return;
  const container = document.getElementById(type + '-gantt-container');
  const totalTime = gantt[gantt.length - 1].end;
  const scale = Math.min(600, window.innerWidth - 160);

  
  const pidColors = {};
  processes.forEach((p, i) => pidColors[p.pid] = COLORS[i % COLORS.length]);

  let html = '<div class="gantt-wrap"><div class="gantt-chart">';

  html += `</div>`; 

  
  html += `<div class="gantt-legend" style="margin-top:20px">`;
  processes.forEach(p => {
    html += `<div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:${pidColors[p.pid]}"></div>${p.pid}</div>`;
  });
  if (preemptEvents.length > 0) {
    html += `<div class="gantt-legend-item"><div class="gantt-legend-dot" style="background:rgba(247,184,79,.8); width:3px; border-radius:1px"></div>Preemption point</div>`;
  }
  html += `</div>`;

  
  html += `<div style="margin-top:20px">`;
  html += `<div style="display:flex; position:relative; height:32px; min-width:${scale}px; border-radius:6px; overflow:hidden">`;
  gantt.forEach(b => {
    const left = (b.start / totalTime) * 100;
    const width = ((b.end - b.start) / totalTime) * 100;
    html += `<div style="position:absolute; left:${left}%; width:${width}%; height:100%; background:${pidColors[b.pid]}; display:flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:700; color:#0a0c10; font-family:var(--font-mono); border-right:1px solid rgba(0,0,0,.3)" title="${b.pid} t${b.start}→t${b.end}">${width>3?b.pid:''}</div>`;
  });
  html += `</div>`;
  
  html += `<div style="position:relative; height:18px; min-width:${scale}px; margin-top:2px">`;
  const uniqueTimes = [...new Set([...gantt.map(g=>g.start), gantt[gantt.length-1].end])].sort((a,b)=>a-b);
  uniqueTimes.forEach(t => {
    const left = (t / totalTime) * 100;
    html += `<div style="position:absolute; left:${left}%; transform:translateX(-50%); font-size:0.62rem; color:var(--muted); font-family:var(--font-mono)">${t}</div>`;
  });
  html += `</div>`;
  html += `</div>`;

  html += `</div>`; 
  container.innerHTML = html;
}


function renderMetrics(type, metrics, hasPriority) {
  const container = document.getElementById(type + '-metrics-container');
  const avgWT = avg(metrics.map(m => m.wt));
  const avgTAT = avg(metrics.map(m => m.tat));
  const avgRT = avg(metrics.map(m => m.rt));

  const accentColor = type === 'priority' ? 'var(--accent-a)' : 'var(--accent-b)';

  let html = `<div style="overflow-x:auto"><table class="metrics-table">
    <thead><tr>
      <th>PID</th><th>Arrival</th><th>Burst</th>
      ${hasPriority ? '<th>Priority</th>' : ''}
      <th>Finish</th>
      <th class="num">WT</th><th class="num">TAT</th><th class="num">RT</th>
    </tr></thead><tbody>`;

  const ci = type === 'priority' ? 'var(--accent-a)' : 'var(--accent-b)';
  metrics.forEach((m, i) => {
    const color = COLORS[i % COLORS.length];
    html += `<tr>
      <td><span class="pid-badge" style="background:${color}22; color:${color}; border:1px solid ${color}44">${m.pid}</span></td>
      <td>${m.arr}</td><td>${m.burst}</td>
      ${hasPriority ? `<td>${m.priority}</td>` : ''}
      <td>${m.ft}</td>
      <td class="num">${m.wt}</td>
      <td class="num">${m.tat}</td>
      <td class="num">${m.rt}</td>
    </tr>`;
  });

  html += `<tr class="avg-row">
    <td colspan="${hasPriority ? 4 : 3}">Average</td>
    <td></td>
    <td class="num">${avgWT.toFixed(2)}</td>
    <td class="num">${avgTAT.toFixed(2)}</td>
    <td class="num">${avgRT.toFixed(2)}</td>
  </tr></tbody></table></div>`;

  
  html += `<div class="grid-3" style="margin-top:20px">
    <div class="stat-card"><div class="stat-label">Avg Waiting Time</div><div class="stat-val" style="color:${accentColor}">${avgWT.toFixed(2)}</div><div class="stat-sub">units</div></div>
    <div class="stat-card"><div class="stat-label">Avg Turnaround Time</div><div class="stat-val" style="color:${accentColor}">${avgTAT.toFixed(2)}</div><div class="stat-sub">units</div></div>
    <div class="stat-card"><div class="stat-label">Avg Response Time</div><div class="stat-val" style="color:${accentColor}">${avgRT.toFixed(2)}</div><div class="stat-sub">units</div></div>
  </div>`;

  container.innerHTML = html;
}


function detectScenarios(type, processes, result) {
  const container = document.getElementById(type + '-scenarios');
  const { metrics, tieEvents, preemptEvents } = result;
  let html = '';

  
  const arrivals = [...new Set(processes.map(p => p.arr))];
  const bursts = [...new Set(processes.map(p => p.burst))];
  const isA = processes.length >= 3 && arrivals.length > 1 && bursts.length > 1;
  html += scenarioItem('A', 'Basic Mixed Workload', isA, isA ? `${processes.length} processes with varied arrival/burst times detected.` : 'Not detected — needs 3+ processes with varied arrivals and burst times.');

  
  let isB = false;
  let bMsg = 'Not detected.';
  if (type === 'priority') {
    const highPriLong = processes.find(p => p.priority === Math.min(...processes.map(x=>x.priority)) && p.burst >= Math.max(...processes.map(x=>x.burst)) * 0.7);
    const lowPriShort = processes.find(p => p.priority === Math.max(...processes.map(x=>x.priority)) && p.burst <= Math.min(...processes.map(x=>x.burst)) * 1.5);
    isB = !!(highPriLong && lowPriShort);
    if (isB) bMsg = `High-priority long process (${highPriLong.pid}) competes with low-priority short process (${lowPriShort.pid}).`;
  } else {
    
    const long = processes.find(p => p.burst >= Math.max(...processes.map(x=>x.burst)) * 0.8);
    const short = processes.find(p => p.burst <= Math.min(...processes.map(x=>x.burst)) * 1.3 && p !== long);
    isB = !!(long && short && long.burst / (short?.burst||1) >= 2);
    if (isB) bMsg = `Long process (${long?.pid}) vs short process (${short?.pid}) detected — SRTF will strongly favor the shorter one.`;
  }
  html += scenarioItem('B', 'Conflict Between Priority / Burst Time', isB, bMsg);

  
  const maxWT = Math.max(...metrics.map(m => m.wt));
  const minWT = Math.min(...metrics.map(m => m.wt));
  const isC = maxWT >= 3 * minWT && maxWT > 5;
  const starved = isC ? metrics.find(m => m.wt === maxWT) : null;
  html += scenarioItem('C', 'Starvation-Sensitive Case', isC,
    isC ? `Process ${starved?.pid} waited ${maxWT} units vs min ${minWT} — starvation risk present.` : 'No significant starvation detected in this workload.',
    isC ? 'warn' : '');

  
  const hasTie = tieEvents.length > 0;
  html += scenarioItem('tie', 'Tie-Breaking Triggered', hasTie,
    hasTie ? `${tieEvents.length} tie-breaking event(s): "${tieEvents[0].reason}"` : 'No ties occurred — all decisions were clear-cut.');

  
  const hasPreempt = preemptEvents.length > 0;
  html += scenarioItem('preempt', 'Preemption Events', hasPreempt,
    hasPreempt ? `${preemptEvents.length} preemption(s) occurred at times: ${preemptEvents.join(', ')}` : 'No preemptions occurred.');

  container.innerHTML = html;
}

function scenarioItem(code, label, detected, msg, forceWarn = '') {
  const cls = forceWarn === 'warn' ? 'warn' : (detected ? 'detected' : '');
  const labelColor = forceWarn === 'warn' ? 'SCENARIO C — WARNING' : (detected ? (code === 'tie' || code === 'preempt' ? 'DETECTED' : `SCENARIO ${code} — DETECTED`) : (code === 'tie' || code === 'preempt' ? 'NOT TRIGGERED' : `SCENARIO ${code} — NOT DETECTED`));
  return `<div class="scenario-item ${cls}">
    <div class="scenario-label">${labelColor}</div>
    <div>${label}</div>
    <div style="color:var(--muted); font-size:0.75rem; margin-top:4px">${msg}</div>
  </div>`;
}


function buildComparison() {
  const pr = state.priority.results;
  const sr = state.srtf.results;

  if (!pr || !sr) {
    document.getElementById('comp-no-data').style.display = 'block';
    document.getElementById('comp-content').style.display = 'none';
    return;
  }

  document.getElementById('comp-no-data').style.display = 'none';
  document.getElementById('comp-content').style.display = 'block';

  const pm = pr.metrics;
  const sm = sr.metrics;

  const avgPW = avg(pm.map(m=>m.wt));
  const avgPT = avg(pm.map(m=>m.tat));
  const avgPR = avg(pm.map(m=>m.rt));
  const avgSW = avg(sm.map(m=>m.wt));
  const avgST = avg(sm.map(m=>m.tat));
  const avgSR = avg(sm.map(m=>m.rt));

  
  const better = (a, b) => a <= b;
  document.getElementById('comp-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Avg WT Winner</div>
      <div class="stat-val" style="font-size:1.1rem; color:${better(avgPW,avgSW)?'var(--accent-a)':'var(--accent-b)'}">${better(avgPW,avgSW)?'Priority':'SRTF'}</div>
      <div class="stat-sub">${Math.min(avgPW,avgSW).toFixed(2)} vs ${Math.max(avgPW,avgSW).toFixed(2)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg TAT Winner</div>
      <div class="stat-val" style="font-size:1.1rem; color:${better(avgPT,avgST)?'var(--accent-a)':'var(--accent-b)'}">${better(avgPT,avgST)?'Priority':'SRTF'}</div>
      <div class="stat-sub">${Math.min(avgPT,avgST).toFixed(2)} vs ${Math.max(avgPT,avgST).toFixed(2)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg RT Winner</div>
      <div class="stat-val" style="font-size:1.1rem; color:${better(avgPR,avgSR)?'var(--accent-a)':'var(--accent-b)'}">${better(avgPR,avgSR)?'Priority':'SRTF'}</div>
      <div class="stat-sub">${Math.min(avgPR,avgSR).toFixed(2)} vs ${Math.max(avgPR,avgSR).toFixed(2)}</div>
    </div>
  `;

  
  const allPids = [...new Set([...pm.map(m=>m.pid), ...sm.map(m=>m.pid)])];
  let ptHTML = `<thead><tr>
    <th>PID</th>
    <th colspan="3" style="color:var(--accent-a)">Priority</th>
    <th colspan="3" style="color:var(--accent-b)">SRTF</th>
  </tr><tr>
    <th></th><th>WT</th><th>TAT</th><th>RT</th><th>WT</th><th>TAT</th><th>RT</th>
  </tr></thead><tbody>`;

  allPids.forEach((pid, i) => {
    const p = pm.find(m=>m.pid===pid);
    const s = sm.find(m=>m.pid===pid);
    const color = COLORS[i % COLORS.length];
    const cell = (pv, sv) => {
      if (pv === undefined || sv === undefined) return `<td>-</td><td>-</td>`;
      const pWin = pv <= sv;
      return `<td class="${pWin?'better-a':'loser'}">${pv}</td><td class="${!pWin?'better-b':'loser'}">${sv}</td>`;
    };
    ptHTML += `<tr>
      <td><span class="pid-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${pid}</span></td>
      ${p && s ? `
        ${cell(p.wt, s.wt)}
        ${cell(p.tat, s.tat)}
        ${cell(p.rt, s.rt)}
      ` : `<td colspan="6" style="text-align:center;color:var(--muted)">N/A</td>`}
    </tr>`;
  });
  ptHTML += `</tbody>`;
  document.getElementById('comp-process-table').innerHTML = ptHTML;

  
  const avgHTML = `<thead><tr>
    <th>Metric</th>
    <th style="color:var(--accent-a)">Priority Avg</th>
    <th style="color:var(--accent-b)">SRTF Avg</th>
    <th>Winner</th>
  </tr></thead><tbody>
    ${avgRow('Waiting Time (WT)', avgPW, avgSW)}
    ${avgRow('Turnaround Time (TAT)', avgPT, avgST)}
    ${avgRow('Response Time (RT)', avgPR, avgSR)}
  </tbody>`;
  document.getElementById('comp-avg-table').innerHTML = avgHTML;

  
  const wtWin = avgPW <= avgSW ? 'Priority' : 'SRTF';
  const rtWin = avgPR <= avgSR ? 'Priority' : 'SRTF';

  const pProcs = state.priority.processes;
  const hasPriority = pProcs.some(p => p.priority !== undefined);
  const hasLongHighPri = hasPriority && pProcs.some(p => p.priority === Math.min(...pProcs.map(x=>x.priority)) && p.burst > avg(pProcs.map(x=>x.burst)));
  const hasShortLowPri = hasPriority && pProcs.some(p => p.priority === Math.max(...pProcs.map(x=>x.priority)) && p.burst < avg(pProcs.map(x=>x.burst)));

  document.getElementById('comp-analysis').innerHTML = `
    <div class="analysis-q">
      <div class="q">Q1: Which algorithm produced the lower average waiting time?</div>
      <div class="a ${wtWin==='Priority'?'a-col':'b-col'}">${wtWin} </div>
    </div>
    <div class="analysis-q">
      <div class="q">Q2: Which algorithm produced the lower average response time?</div>
      <div class="a ${rtWin==='Priority'?'a-col':'b-col'}">${rtWin} </div>
    </div>
    <div class="analysis-q">
      <div class="q">Q3: Did priority values improve treatment of urgent processes?</div>
      <div class="a ${hasLongHighPri?'a-col':'c-col'}">${hasLongHighPri ? 'Yes — high-priority processes ran first even when not shortest, serving urgency effectively.' : 'Partially — priority rules ensured ordering, but may delay short low-priority jobs unnecessarily.'}</div>
    </div>
    <div class="analysis-q">
      <div class="q">Q4: Did SRTF favor short jobs more aggressively?</div>
      <div class="a b-col">Yes — SRTF preempts the running process the moment a shorter job arrives, giving short processes minimal waiting time regardless of their priority.</div>
    </div>
    <div class="analysis-q">
      <div class="q">Q5: Which algorithm would you recommend for this workload?</div>
      <div class="a c-col">${recommend(avgPW,avgSW,avgPT,avgST,avgPR,avgSR)}</div>
    </div>
  `;

  
  document.getElementById('comp-tradeoff').innerHTML = `
    <div class="scenario-item detected">
      <div class="scenario-label">Priority Scheduling</div>
      <strong style="color:var(--accent-a)">Strengths:</strong> Policy-driven service, urgent processes guaranteed CPU. Respects external importance.<br>
      <strong style="color:var(--accent-b)">Weakness:</strong> Short low-priority processes may starve if high-priority processes keep arriving.
    </div>
    <div class="scenario-item warn">
      <div class="scenario-label">SRTF Scheduling</div>
      <strong style="color:var(--accent-c)">Strengths:</strong> Minimizes average WT and TAT globally. Optimal for throughput and short-job response.<br>
      <strong style="color:var(--accent-b)">Weakness:</strong> Long processes can starve indefinitely. No notion of urgency or policy — purely burst-time driven.
    </div>
  `;

  
  const overallWin = scoreWinner(avgPW,avgSW,avgPT,avgST,avgPR,avgSR);

  
  const pProcsAll = state.priority.processes;
  const hasPriData = pProcsAll.some(p => p.priority !== undefined);
  let conflictMsg = '';
  if (hasPriData && pProcsAll.length >= 2) {
    const sorted = [...pProcsAll].sort((a,b) => a.priority - b.priority);
    const highPri = sorted[0];
    const lowPri = sorted[sorted.length - 1];
    if (highPri && lowPri && highPri.burst > lowPri.burst) {
      conflictMsg = `<strong>${highPri.pid}</strong> (Priority ${highPri.priority}, Burst ${highPri.burst}) has higher priority but longer burst than <strong>${lowPri.pid}</strong> (Priority ${lowPri.priority}, Burst ${lowPri.burst}). Priority scheduling runs ${highPri.pid} first by policy, while SRTF would favor ${lowPri.pid} for its shorter burst — a direct conflict between policy-based and burst-time-based service.`;
    }
  }

  
  const pMaxWT = Math.max(...pm.map(m=>m.wt));
  const sMaxWT = Math.max(...sm.map(m=>m.wt));
  const pStarved = pm.find(m => m.wt === pMaxWT);
  const sStarved = sm.find(m => m.wt === sMaxWT);
  const starvThreshold = 5;

  document.getElementById('comp-conclusion').innerHTML = `
    <div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(79,217,160,.15); color:var(--accent-c)"></div>
      <div class="conclusion-text"><strong>Overall Performance:</strong> ${overallWin === 'Priority' ? '<span style="color:var(--accent-a)">Priority Scheduling</span>' : '<span style="color:var(--accent-b)">SRTF</span>'} performed better on this dataset based on combined WT, TAT, and RT averages.</div>
    </div>
    <div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(79,142,247,.15); color:var(--accent-a)"></div>
      <div class="conclusion-text"><strong>Metric Leaders:</strong>
        <span style="color:var(--accent-a)">Priority</span> — better at: ${metricLeaders('Priority', avgPW,avgSW,avgPT,avgST,avgPR,avgSR)}<br>
        <span style="color:var(--accent-b)">SRTF</span> — better at: ${metricLeaders('SRTF', avgPW,avgSW,avgPT,avgST,avgPR,avgSR)}
      </div>
    </div>
    ${conflictMsg ? `<div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(247,184,79,.15); color:var(--accent-warn)"></div>
      <div class="conclusion-text"><strong>Priority vs Burst-Time Conflict (Detected in Workload):</strong><br>${conflictMsg}</div>
    </div>` : ''}
    <div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(247,184,79,.15); color:var(--accent-warn)"></div>
      <div class="conclusion-text"><strong>Policy-Based vs Burst-Time-Based Service:</strong><br>
        <span style="color:var(--accent-a)">Priority Scheduling</span> is policy-driven — it enforces external importance assignments, making it suitable for real-time systems where urgency must be respected regardless of job length.<br>
        <span style="color:var(--accent-b)">SRTF</span> is burst-time-driven — it always runs the shortest remaining job to minimize waiting time, maximizing throughput but ignoring process importance entirely.
      </div>
    </div>
    <div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(247,95,79,.15); color:var(--accent-b)"></div>
      <div class="conclusion-text"><strong>Starvation Risk:</strong><br>
        <span style="color:var(--accent-a)">Priority</span>: ${pMaxWT > starvThreshold ? `<span style="color:var(--accent-warn)">Risk detected — ${pStarved?.pid} waited ${pMaxWT} units. Low-priority processes can starve if high-priority ones keep arriving.</span>` : `Low risk in this workload (max WT: ${pMaxWT}). Starvation still possible under continuous high-priority arrivals.`}<br>
        <span style="color:var(--accent-b)">SRTF</span>: ${sMaxWT > starvThreshold ? `<span style="color:var(--accent-warn)">Risk detected — ${sStarved?.pid} waited ${sMaxWT} units. Long processes can starve when shorter jobs keep arriving.</span>` : `Low risk in this workload (max WT: ${sMaxWT}). Long processes can still starve in busier systems.`}
      </div>
    </div>
    <div class="conclusion-item">
      <div class="conclusion-icon" style="background:rgba(191,122,247,.15); color:#bf7af7"></div>
      <div class="conclusion-text"><strong>Fairness:</strong> ${fairness(avgPW,avgSW,pm,sm)}<br>
        <span style="color:var(--muted); font-size:0.82rem">Fairness in Priority depends on how priorities are assigned — biased assignments cause unfair treatment. SRTF is fair to short jobs but structurally unfair to long ones.</span>
      </div>
    </div>
  `;
}

function avgRow(label, pv, sv) {
  const pWin = pv <= sv;
  return `<tr>
    <td>${label}</td>
    <td class="${pWin?'better-a':'loser'}">${pv.toFixed(2)} ${pWin?'':''}</td>
    <td class="${!pWin?'better-b':'loser'}">${sv.toFixed(2)} ${!pWin?'':''}</td>
    <td class="${pWin?'better-a':'better-b'}">${pWin?'Priority':'SRTF'}</td>
  </tr>`;
}

function recommend(pw, sw, pt, st, pr, sr) {
  let pScore = 0, sScore = 0;
  if (pw <= sw) pScore++; else sScore++;
  if (pt <= st) pScore++; else sScore++;
  if (pr <= sr) pScore++; else sScore++;
  if (pScore > sScore) return `Priority Scheduling — wins on ${pScore}/3 metrics for this workload. Best when process urgency matters.`;
  if (sScore > pScore) return `SRTF — wins on ${sScore}/3 metrics for this workload. Best for maximizing throughput with short jobs.`;
  return `Tie — both algorithms perform equally on this workload. Choose Priority if urgency matters, SRTF for pure efficiency.`;
}

function scoreWinner(pw, sw, pt, st, pr, sr) {
  let ps = 0, ss = 0;
  if (pw <= sw) ps++; else ss++;
  if (pt <= st) ps++; else ss++;
  if (pr <= sr) ps++; else ss++;
  return ps >= ss ? 'Priority' : 'SRTF';
}

function metricLeaders(who, pw, sw, pt, st, pr, sr) {
  const leaders = [];
  if ((who==='Priority' && pw<=sw)||(who==='SRTF' && sw<pw)) leaders.push('WT');
  if ((who==='Priority' && pt<=st)||(who==='SRTF' && st<pt)) leaders.push('TAT');
  if ((who==='Priority' && pr<=sr)||(who==='SRTF' && sr<pr)) leaders.push('RT');
  return leaders.length ? leaders.join(', ') : 'None';
}

function fairness(pw, sw, pm, sm) {
  const pMaxWT = Math.max(...pm.map(m=>m.wt));
  const sMaxWT = Math.max(...sm.map(m=>m.wt));
  if (pMaxWT <= sMaxWT) return `<span style="color:var(--accent-a)">Priority Scheduling</span> showed fairer distribution — max waiting time of ${pMaxWT} vs SRTF's ${sMaxWT}. However, fairness in Priority depends heavily on the priority assignment.`;
  return `<span style="color:var(--accent-b)">SRTF</span> showed fairer overall distribution — max waiting time of ${sMaxWT} vs Priority's ${pMaxWT}. SRTF's burst-time optimization tends to reduce extreme waiting cases.`;
}


function avg(arr) { return arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0; }



addRow('priority');
addRow('srtf');