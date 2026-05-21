// ===== FORM VALIDATION =====

document.addEventListener('DOMContentLoaded', () => {

  const welcomeForm = document.getElementById('welcomeForm');

  if(welcomeForm){

    welcomeForm.addEventListener('submit', function(e){

      e.preventDefault();

      const name = document.getElementById('studentName').value.trim();
      const email = document.getElementById('studentEmail').value.trim();
      const semester = document.getElementById('studentSemester').value;

      let isValid = true;

      document.getElementById('nameError').textContent = '';
      document.getElementById('emailError').textContent = '';
      document.getElementById('semesterError').textContent = '';

      // Name Validation
      if(name.length < 3){
        document.getElementById('nameError').textContent =
        'Name must contain minimum 3 characters';
        isValid = false;
      }

      // Email Validation
      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

      if(!email.match(emailPattern)){
        document.getElementById('emailError').textContent =
        'Enter valid email';
        isValid = false;
      }

      // Semester Validation
      if(semester === ''){
        document.getElementById('semesterError').textContent =
        'Please select semester';
        isValid = false;
      }

      if(isValid){

        // Object Destructuring
        const student = {
          name,
          email,
          semester
        };

        const { name:studentName, email:studentEmail } = student;

        console.log(studentName, studentEmail);

        // JSON Handling
        localStorage.setItem(
          'studentData',
          JSON.stringify(student)
        );

        alert(`Welcome ${studentName} 🚀`);

        document
          .getElementById('welcomeScreen')
          .classList.add('fade-out');
      }

    });

  }

});
// ===== STATE =====
let state = {
  tasks: [],
  subjects: [],
  goals: [],
  scheduleEvents: [],
  settings: { name: '', semester: '' },
  pomodoro: { sessions: 0 },
  activeFilter: 'all',
  editingTaskId: null,
  editingSubjectId: null,
};

// ===== LOCALSTORAGE =====
function saveState() {
  localStorage.setItem('smartplanner_v1', JSON.stringify(state));
  // Auto-save indicator (subtle)
  showToast('Auto-saved', 'success', 1000);
}
function loadState() {
  const raw = localStorage.getItem('smartplanner_v1');
  if (raw) {
    try {
      const loaded = JSON.parse(raw);
      state = { ...state, ...loaded };
    } catch(e) {}
  }
}

// ===== UTILS =====
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - today) / 86400000);
}
function deadlinePill(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return '';
  if (days < 0) return `<span class="deadline-pill urgent">⚠ Overdue ${Math.abs(days)}d</span>`;
  if (days === 0) return `<span class="deadline-pill urgent">🔴 Due today</span>`;
  if (days <= 2) return `<span class="deadline-pill urgent">🟠 ${days}d left</span>`;
  if (days <= 7) return `<span class="deadline-pill soon">🟡 ${days}d left</span>`;
  return `<span class="deadline-pill ok">🟢 ${days}d left</span>`;
}

const SUBJECT_COLORS = {
  purple: { bg:'rgba(124,111,255,0.15)', bar:'linear-gradient(90deg,#7c6fff,#9b8eff)' },
  pink:   { bg:'rgba(255,107,138,0.15)', bar:'linear-gradient(90deg,#ff6b8a,#ff9ab3)' },
  green:  { bg:'rgba(0,229,176,0.15)',   bar:'linear-gradient(90deg,#00e5b0,#00ffcc)' },
  orange: { bg:'rgba(255,179,71,0.15)',  bar:'linear-gradient(90deg,#ffb347,#ffd080)' },
  blue:   { bg:'rgba(80,180,255,0.15)',  bar:'linear-gradient(90deg,#50b4ff,#80ccff)' },
};

function toast(msg, type='info') {
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  const icon = type==='success'?'✓':type==='error'?'✕':'ℹ';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== GREETING =====
window.addEventListener("load",()=>{

let hour = new Date().getHours();

let greet = "Day";

if(hour < 12){
greet = "Morning";
}
else if(hour < 18){
greet = "Afternoon";
}
else{
greet = "Evening";
}

document.getElementById("greetTime").innerText = greet;

});
//LIVE CLOCK//
setInterval(()=>{

const now = new Date();

document.getElementById("dateChip").innerHTML =
now.toLocaleDateString() + " • " +
now.toLocaleTimeString();

},1000);
// KEYBOARD SHORTCUTS
document.addEventListener("keydown",(e)=>{

if(e.key === "n"){
openAddTask();
}

});
// AUTO-SAVE ON EXIT
window.addEventListener("beforeunload",()=>{

localStorage.setItem("smartplanner-data",
JSON.stringify(tasks));

});

// ===== NAVIGATION =====
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-panel="${id}"]`).classList.add('active');
  closeSidebar();
  if (id === 'analytics') renderAnalytics();
  if (id === 'schedule') renderSchedule();
}
document.querySelectorAll('.nav-item').forEach(n => {
  n.addEventListener('click', () => switchPanel(n.dataset.panel));
});

// Hamburger
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlayClose').classList.toggle('show');
});
document.getElementById('overlayClose').addEventListener('click', closeSidebar);
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlayClose').classList.remove('show');
}

// ===== THEME =====
let isDark = true;
function initTheme() {
  const saved = localStorage.getItem('sp_theme');
  isDark = saved !== 'light';
  applyTheme();
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('sp_theme', isDark ? 'dark' : 'light');
}
document.getElementById('themeBtn').addEventListener('click', () => {
  isDark = !isDark; applyTheme();
});

// ===== TASKS =====
function openAddTask() {
  state.editingTaskId = null;
  document.getElementById('taskModalTitle').textContent = 'New Task';
  clearTaskForm();
  populateSubjectSelect();
  document.getElementById('tDeadline').value = new Date().toISOString().split('T')[0];
  openModal('taskModal');
}
function openEditTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  state.editingTaskId = id;
  document.getElementById('taskModalTitle').textContent = 'Edit Task';
  populateSubjectSelect();
  document.getElementById('tName').value = task.name;
  document.getElementById('tDesc').value = task.desc || '';
  document.getElementById('tSubject').value = task.subject || '';
  document.getElementById('tPriority').value = task.priority;
  document.getElementById('tDeadline').value = task.deadline;
  document.getElementById('tStatus').value = task.status;
  document.getElementById('tHours').value = task.hours || '';
  clearTaskErrors();
  openModal('taskModal');
}
function clearTaskForm() {
  ['tName','tDesc','tSubject','tPriority','tDeadline','tStatus','tHours'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = el.tagName === 'SELECT' ? '' : '';
  });
  document.getElementById('tStatus').value = 'pending';
  clearTaskErrors();
}
function clearTaskErrors() {
  ['tNameErr','tSubjectErr','tPriorityErr','tDeadlineErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  ['tName','tSubject','tPriority','tDeadline'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}
function validateTask() {
  let valid = true;
  clearTaskErrors();
  const name = document.getElementById('tName').value.trim();
  if (!name) {
    document.getElementById('tNameErr').classList.add('show');
    document.getElementById('tName').classList.add('error');
    valid = false;
  }
  const subject = document.getElementById('tSubject').value;
  if (!subject) {
    document.getElementById('tSubjectErr').classList.add('show');
    document.getElementById('tSubject').classList.add('error');
    valid = false;
  }
  const priority = document.getElementById('tPriority').value;
  if (!priority) {
    document.getElementById('tPriorityErr').classList.add('show');
    document.getElementById('tPriority').classList.add('error');
    valid = false;
  }
  const deadline = document.getElementById('tDeadline').value;
  if (!deadline) {
    document.getElementById('tDeadlineErr').classList.add('show');
    document.getElementById('tDeadline').classList.add('error');
    valid = false;
  }
  return valid;
}
function saveTask() {
  if (!validateTask()) return;
  const task = {
    id: state.editingTaskId || uid(),
    name: document.getElementById('tName').value.trim(),
    desc: document.getElementById('tDesc').value.trim(),
    subject: document.getElementById('tSubject').value,
    priority: document.getElementById('tPriority').value,
    deadline: document.getElementById('tDeadline').value,
    status: document.getElementById('tStatus').value,
    hours: parseFloat(document.getElementById('tHours').value) || 0,
    createdAt: state.editingTaskId ? (state.tasks.find(t=>t.id===state.editingTaskId)||{}).createdAt : Date.now(),
  };
  if (state.editingTaskId) {
    const idx = state.tasks.findIndex(t => t.id === state.editingTaskId);
    if (idx !== -1) state.tasks[idx] = task;
    toast('Task updated!', 'success');
  } else {
    state.tasks.push(task);
    toast('Task added!', 'success');
  }
  saveState();
  closeModal('taskModal');
  renderAll();
}
function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState(); renderAll();
  toast('Task deleted.', 'info');
}
function toggleTaskDone(id) {
  const t = state.tasks.find(t => t.id === id);
  if (!t) return;
  t.status = t.status === 'done' ? 'pending' : 'done';
  saveState(); renderAll();
}

// ===== AI PRIORITY ALGORITHM =====
function computeScore(task) {
  const priorityScore = { critical: 100, high: 70, medium: 40, low: 15 }[task.priority] || 0;
  const days = daysUntil(task.deadline);
  let urgencyScore = 0;
  if (days !== null) {
    if (days < 0) urgencyScore = 120;
    else if (days === 0) urgencyScore = 100;
    else if (days <= 1) urgencyScore = 80;
    else if (days <= 3) urgencyScore = 60;
    else if (days <= 7) urgencyScore = 30;
    else urgencyScore = 10;
  }
  const hoursScore = Math.min(task.hours * 3, 30);
  return priorityScore + urgencyScore + hoursScore;
}
function getRecommendations() {
  return state.tasks
    .filter(t => t.status !== 'done')
    .map(t => ({ ...t, score: computeScore(t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ===== RENDER TASKS =====
function taskHTML(task, showCheck=true) {
  const days = daysUntil(task.deadline);
  const isOverdue = days !== null && days < 0 && task.status !== 'done';
  const statusMap = { pending:'badge-pending', 'in-progress':'badge-in-progress', done:'badge-done' };
  const statusLabel = { pending:'Pending', 'in-progress':'In Progress', done:'Done' };
  const subj = state.subjects.find(s => s.id === task.subject);
  return `
  <div class="task-item ${task.priority}" id="task-${task.id}">
    ${showCheck ? `<div class="task-check ${task.status==='done'?'checked':''}" onclick="toggleTaskDone('${task.id}')">${task.status==='done'?'✓':''}</div>` : ''}
    <div class="task-body">
      <div class="task-name ${task.status==='done'?'done-text':''}">${task.name}</div>
      <div class="task-meta">
        <span class="badge badge-${task.priority}"><span class="dot"></span>${task.priority}</span>
        <span class="badge ${statusMap[task.status]}">${statusLabel[task.status]}</span>
        ${subj ? `<span class="task-meta-item">📚 ${subj.name}</span>` : ''}
        <span class="task-meta-item">📅 ${formatDate(task.deadline)}</span>
        ${task.hours ? `<span class="task-meta-item">⏱ ${task.hours}h</span>` : ''}
        ${isOverdue ? `<span class="deadline-pill urgent">⚠ Overdue</span>` : deadlinePill(task.deadline)}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-btn" onclick="openEditTask('${task.id}')" title="Edit">✎</button>
      <button class="task-btn danger" onclick="deleteTask('${task.id}')" title="Delete">✕</button>
    </div>
  </div>`;
}

function renderTasks() {
  const filter = state.activeFilter;
  const search = (document.getElementById('taskSearch')||{value:''}).value.toLowerCase();
  let filtered = state.tasks.filter(t => {
    const days = daysUntil(t.deadline);
    const isOverdue = days !== null && days < 0 && t.status !== 'done';
    if (filter === 'pending' && t.status !== 'pending') return false;
    if (filter === 'in-progress' && t.status !== 'in-progress') return false;
    if (filter === 'done' && t.status !== 'done') return false;
    if (filter === 'critical' && t.priority !== 'critical') return false;
    if (filter === 'overdue' && !isOverdue) return false;
    if (search && !t.name.toLowerCase().includes(search) && !(t.desc||'').toLowerCase().includes(search)) return false;
    return true;
  });
  filtered.sort((a,b) => computeScore(b) - computeScore(a));
  const el = document.getElementById('fullTaskList');
  if (!el) return;
  if (filtered.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No tasks found</div><div class="empty-body">Try a different filter or add a new task.</div></div>`;
  } else {
    el.innerHTML = filtered.map(t => taskHTML(t)).join('');
  }
}

// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', function() {
    state.activeFilter = this.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    renderTasks();
  });
});

// ===== RENDER DASHBOARD =====
function renderDashboard() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.status === 'done').length;
  const pending = state.tasks.filter(t => t.status !== 'done').length;
  const overdue = state.tasks.filter(t => {
    const d = daysUntil(t.deadline);
    return d !== null && d < 0 && t.status !== 'done';
  }).length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statOverdue').textContent = overdue;
  document.getElementById('statDonePct').textContent = pct + '% done';
  document.getElementById('overallPct').textContent = pct + '%';
  document.getElementById('overallBar').style.width = pct + '%';

  // Priority counts
  ['critical','high','medium','low'].forEach(p => {
    const count = state.tasks.filter(t=>t.priority===p).length;
    document.getElementById(p.slice(0,4)+'Count').textContent = count;
  });
  document.getElementById('critCount').textContent = state.tasks.filter(t=>t.priority==='critical').length;

  // Sidebar stats
  document.getElementById('taskBadge').textContent = pending;
  document.getElementById('sideCompletedPct').textContent = pct + '%';
  document.getElementById('sidePendingCount').textContent = pending;
  document.getElementById('sideOverdueCount').textContent = overdue;

  // AI Recommendations
  const recs = getRecommendations();
  const recEl = document.getElementById('recTasks');
  if (recs.length === 0) {
    recEl.innerHTML = `<div class="empty-state" style="padding:20px"><div class="empty-icon">🤖</div><div class="empty-body">Add tasks to get AI-powered study recommendations.</div></div>`;
  } else {
    recEl.innerHTML = recs.map((t,i) => {
      const subj = state.subjects.find(s=>s.id===t.subject);
      return `<div class="rec-task-item">
        <div class="rec-rank">${i+1}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.85rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
          <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text3);margin-top:2px;">${subj?subj.name:t.subject} · Score: ${Math.round(t.score)}</div>
        </div>
        <span class="badge badge-${t.priority}">${t.priority}</span>
        ${deadlinePill(t.deadline)}
      </div>`;
    }).join('');
  }

  // Today's urgent tasks (top 4)
  const urgent = state.tasks
    .filter(t => t.status !== 'done')
    .sort((a,b) => computeScore(b) - computeScore(a))
    .slice(0, 4);
  const dashEl = document.getElementById('dashTaskList');
  if (urgent.length === 0) {
    dashEl.innerHTML = `<div class="empty-state" style="padding:24px"><div class="empty-icon">🎉</div><div class="empty-title">All caught up!</div><div class="empty-body">No pending tasks right now.</div></div>`;
  } else {
    dashEl.innerHTML = urgent.map(t => taskHTML(t)).join('');
  }
}

// ===== SUBJECTS =====
function populateSubjectSelect() {
  const el = document.getElementById('tSubject');
  el.innerHTML = '<option value="">Select subject</option>';
  state.subjects.forEach(s => {
    el.innerHTML += `<option value="${s.id}">${s.emoji||'📚'} ${s.name}</option>`;
  });
}
function openAddSubject() {
  state.editingSubjectId = null;
  document.getElementById('subjectModalTitle').textContent = 'Add Subject';
  ['sName','sCode','sInstructor'].forEach(id => document.getElementById(id).value='');
  document.getElementById('sColor').value='purple';
  document.getElementById('sEmoji').value='📚';
  document.getElementById('sNameErr').classList.remove('show');
  document.getElementById('sName').classList.remove('error');
  openModal('subjectModal');
}
function saveSubject() {
  const name = document.getElementById('sName').value.trim();
  if (!name) {
    document.getElementById('sNameErr').classList.add('show');
    document.getElementById('sName').classList.add('error');
    return;
  }
  const subj = {
    id: state.editingSubjectId || uid(),
    name,
    code: document.getElementById('sCode').value.trim(),
    instructor: document.getElementById('sInstructor').value.trim(),
    color: document.getElementById('sColor').value,
    emoji: document.getElementById('sEmoji').value || '📚',
  };
  if (state.editingSubjectId) {
    const idx = state.subjects.findIndex(s=>s.id===state.editingSubjectId);
    if (idx!==-1) state.subjects[idx] = subj;
    toast('Subject updated!','success');
  } else {
    state.subjects.push(subj);
    toast('Subject added!','success');
  }
  saveState(); closeModal('subjectModal'); renderAll();
  populateFormSubjects();
}
function deleteSubject(id) {
  if (!confirm('Delete this subject? Tasks linked to it will lose the subject reference.')) return;
  state.subjects = state.subjects.filter(s=>s.id!==id);
  saveState(); renderAll();
  populateFormSubjects();
  toast('Subject deleted.','info');
}
function renderSubjects() {
  const el = document.getElementById('subjectGrid');
  if (!el) return;
  if (state.subjects.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:60px"><div class="empty-icon">📚</div><div class="empty-title">No subjects yet</div><div class="empty-body">Add your course subjects to start organizing.</div></div>`;
    return;
  }
  el.innerHTML = state.subjects.map(s => {
    const tasks = state.tasks.filter(t=>t.subject===s.id);
    const done = tasks.filter(t=>t.status==='done').length;
    const pct = tasks.length > 0 ? Math.round(done/tasks.length*100) : 0;
    const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.purple;
    return `<div class="subject-card">
      <div class="subject-card-top">
        <div>
          <div class="subject-name">${s.name}</div>
          <div class="subject-code">${s.code||''} ${s.instructor?'· '+s.instructor:''}</div>
        </div>
        <div class="subject-color-dot" style="background:${c.bg}">${s.emoji||'📚'}</div>
      </div>
      <div class="subject-progress-label">
        <span>Progress</span>
        <span class="subject-pct">${pct}%</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar" style="width:${pct}%;background:${c.bar}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:0.75rem;color:var(--text2);">
        <span>${tasks.length} tasks · ${done} done</span>
        <div style="display:flex;gap:6px;">
          <button class="task-btn" onclick="editSubject('${s.id}')">✎</button>
          <button class="task-btn danger" onclick="deleteSubject('${s.id}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function editSubject(id) {
  const s = state.subjects.find(x=>x.id===id);
  if (!s) return;
  state.editingSubjectId = id;
  document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
  document.getElementById('sName').value = s.name;
  document.getElementById('sCode').value = s.code||'';
  document.getElementById('sInstructor').value = s.instructor||'';
  document.getElementById('sColor').value = s.color;
  document.getElementById('sEmoji').value = s.emoji||'';
  document.getElementById('sNameErr').classList.remove('show');
  document.getElementById('sName').classList.remove('error');
  openModal('subjectModal');
}

// ===== GOALS =====
function openAddGoal() {
  document.getElementById('gTitle').value='';
  document.getElementById('gDeadline').value='';
  document.getElementById('gProgress').value='0';
  document.getElementById('gIcon').value='🎯';
  document.getElementById('gTitleErr').classList.remove('show');
  document.getElementById('gDeadlineErr').classList.remove('show');
  openModal('goalModal');
}
function saveGoal() {
  const title = document.getElementById('gTitle').value.trim();
  const deadline = document.getElementById('gDeadline').value;
  let valid = true;
  document.getElementById('gTitleErr').classList.remove('show');
  document.getElementById('gDeadlineErr').classList.remove('show');
  if (!title) { document.getElementById('gTitleErr').classList.add('show'); valid=false; }
  if (!deadline) { document.getElementById('gDeadlineErr').classList.add('show'); valid=false; }
  if (!valid) return;
  state.goals.push({
    id: uid(), title, deadline,
    progress: parseInt(document.getElementById('gProgress').value)||0,
    icon: document.getElementById('gIcon').value||'🎯',
  });
  saveState(); closeModal('goalModal'); renderGoals();
  toast('Goal added!','success');
}
function deleteGoal(id) {
  state.goals = state.goals.filter(g=>g.id!==id);
  saveState(); renderGoals();
}
function updateGoalProgress(id, val) {
  const g = state.goals.find(x=>x.id===id);
  if (g) { g.progress = parseInt(val)||0; saveState(); renderGoals(); }
}
function renderGoals() {
  const el = document.getElementById('goalList');
  if (!el) return;
  if (state.goals.length===0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">No goals set</div><div class="empty-body">Set academic milestones to keep yourself motivated!</div></div>`;
    return;
  }
  el.innerHTML = state.goals.map(g => {
    const c = g.progress>=100?'var(--accent3)':g.progress>=50?'var(--accent)':'var(--accent4)';
    return `<div class="goal-item">
      <div class="goal-icon">${g.icon}</div>
      <div class="goal-body">
        <div class="goal-title">${g.title}</div>
        <div class="goal-deadline">🗓 Target: ${formatDate(g.deadline)} ${deadlinePill(g.deadline)}</div>
        <div class="goal-progress-row">
          <input type="range" style="flex:1;accent-color:${c}" value="${g.progress}" min="0" max="100"
            oninput="updateGoalProgress('${g.id}',this.value)"/>
          <div class="goal-pct" style="color:${c}">${g.progress}%</div>
        </div>
        <div class="goal-progress-wrap" style="margin-top:6px;">
          <div style="height:100%;width:${g.progress}%;background:${c};border-radius:100px;transition:width 0.6s;"></div>
        </div>
      </div>
      <button class="task-btn danger" onclick="deleteGoal('${g.id}')">✕</button>
    </div>`;
  }).join('');
}

// ===== SCHEDULE =====
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_COLORS = {
  purple:'rgba(124,111,255,0.2)',pink:'rgba(255,107,138,0.2)',
  green:'rgba(0,229,176,0.2)',orange:'rgba(255,179,71,0.2)',
};
function openAddSchedule() {
  document.getElementById('evTitle').value='';
  document.getElementById('evTime').value='09:00';
  document.getElementById('evDay').value='0';
  document.getElementById('evColor').value='purple';
  document.getElementById('evTitleErr').classList.remove('show');
  openModal('scheduleModal');
}
function saveScheduleEvent() {
  const title = document.getElementById('evTitle').value.trim();
  if (!title) { document.getElementById('evTitleErr').classList.add('show'); return; }
  state.scheduleEvents.push({
    id: uid(), title,
    day: parseInt(document.getElementById('evDay').value),
    time: document.getElementById('evTime').value,
    color: document.getElementById('evColor').value,
  });
  saveState(); closeModal('scheduleModal'); renderSchedule();
  toast('Event added!','success');
}
function deleteEvent(id) {
  state.scheduleEvents = state.scheduleEvents.filter(e=>e.id!==id);
  saveState(); renderSchedule();
}
function renderSchedule() {
  const el = document.getElementById('weekGrid');
  if (!el) return;
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1; // Mon=0
  el.innerHTML = DAYS.map((day, i) => {
    const events = state.scheduleEvents.filter(e=>e.day===i)
      .sort((a,b)=>a.time.localeCompare(b.time));
    return `<div class="day-col ${i===todayIdx?'today':''}">
      <div class="day-head">${day.slice(0,3)}</div>
      <div class="day-date">${i===todayIdx?'Today':''}</div>
      ${events.map(e=>`
        <div class="sched-event" style="background:${DAY_COLORS[e.color]||DAY_COLORS.purple};color:var(--text);"
          title="${e.title}" onclick="if(confirm('Delete event: ${e.title}?'))deleteEvent('${e.id}')">
          ${e.time} ${e.title}
        </div>`).join('')}
      ${events.length===0?`<div style="font-size:0.65rem;color:var(--text3);text-align:center;margin-top:16px;">Free</div>`:''}
    </div>`;
  }).join('');
}

// ===== ANALYTICS =====
function renderAnalytics() {
  renderSubjectBar();
  renderDonut();
  renderPriorityBar();
  renderWeeklyBar();
}
function renderSubjectBar() {
  const el = document.getElementById('subjectBarChart');
  if (!el) return;
  if (state.subjects.length===0) { el.innerHTML='<div style="color:var(--text3);font-size:0.82rem;text-align:center;padding:20px;">Add subjects and tasks to see analytics.</div>'; return; }
  const max = Math.max(1, ...state.subjects.map(s=>state.tasks.filter(t=>t.subject===s.id).length));
  el.innerHTML = state.subjects.map(s=>{
    const count = state.tasks.filter(t=>t.subject===s.id).length;
    const c = SUBJECT_COLORS[s.color]||SUBJECT_COLORS.purple;
    const w = Math.round(count/max*100);
    return `<div class="bar-chart-row">
      <div class="bar-chart-label" title="${s.name}">${s.name.slice(0,8)}…</div>
      <div class="bar-chart-track"><div class="bar-chart-fill" style="width:${w}%;background:${c.bar}"></div></div>
      <div class="bar-chart-val">${count}</div>
    </div>`;
  }).join('');
}
function renderDonut() {
  const svg = document.getElementById('donutChart');
  const legend = document.getElementById('donutLegend');
  if (!svg||!legend) return;
  const data = [
    {label:'Done',val:state.tasks.filter(t=>t.status==='done').length,color:'#00e5b0'},
    {label:'In Progress',val:state.tasks.filter(t=>t.status==='in-progress').length,color:'#7c6fff'},
    {label:'Pending',val:state.tasks.filter(t=>t.status==='pending').length,color:'#ffb347'},
  ];
  const total = data.reduce((s,d)=>s+d.val,0)||1;
  const r=48,cx=60,cy=60;
  const circ=2*Math.PI*r;
  let offset=0;
  let circles='<circle cx="60" cy="60" r="48" fill="none" stroke="var(--bg4)" stroke-width="16"/>';
  data.forEach(d=>{
    const pct=d.val/total;
    const dash=circ*pct;
    circles+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="16"
      stroke-dasharray="${dash} ${circ-dash}" stroke-dashoffset="${-offset}" stroke-linecap="round"/>`;
    offset+=dash;
  });
  svg.innerHTML=circles;
  legend.innerHTML=data.map(d=>`<div class="legend-item"><div class="legend-dot" style="background:${d.color}"></div>${d.label}: <strong>${d.val}</strong></div>`).join('');
}
function renderPriorityBar() {
  const el = document.getElementById('priorityBarChart');
  if (!el) return;
  const priorities=[{k:'critical',l:'Critical',c:'#ff6b8a'},{k:'high',l:'High',c:'#ffb347'},{k:'medium',l:'Medium',c:'#7c6fff'},{k:'low',l:'Low',c:'#00e5b0'}];
  const max=Math.max(1,...priorities.map(p=>state.tasks.filter(t=>t.priority===p.k).length));
  el.innerHTML=priorities.map(p=>{
    const count=state.tasks.filter(t=>t.priority===p.k).length;
    const w=Math.round(count/max*100);
    return `<div class="bar-chart-row">
      <div class="bar-chart-label">${p.l}</div>
      <div class="bar-chart-track"><div class="bar-chart-fill" style="width:${w}%;background:${p.c}"></div></div>
      <div class="bar-chart-val">${count}</div>
    </div>`;
  }).join('');
}
function renderWeeklyBar() {
  const el = document.getElementById('weeklyBarChart');
  if (!el) return;
  // tasks completed per day of week (simulated from createdAt)
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const counts = days.map((_,i)=>state.tasks.filter(t=>t.status==='done'&&new Date(t.createdAt).getDay()===(i+1)%7).length);
  const max=Math.max(1,...counts);
  el.innerHTML=days.map((d,i)=>{
    const w=Math.round(counts[i]/max*100);
    return `<div class="bar-chart-row">
      <div class="bar-chart-label">${d}</div>
      <div class="bar-chart-track"><div class="bar-chart-fill" style="width:${w}%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div></div>
      <div class="bar-chart-val">${counts[i]}</div>
    </div>`;
  }).join('');
}

// ===== POMODORO =====
let pomoInterval = null;
let pomoRunning = false;
let pomoTotal = 25*60;
let pomoRemaining = 25*60;
let pomoMode = 25;
let pomoSessions = 0;

document.querySelectorAll('[data-pomo]').forEach(tab=>{
  tab.addEventListener('click',function(){
    document.querySelectorAll('[data-pomo]').forEach(t=>t.classList.remove('active'));
    this.classList.add('active');
    const mins=parseInt(this.dataset.pomo);
    pomoMode=mins;
    setPomoMode(mins);
    const labels={25:'Focus',5:'Short Break',15:'Long Break'};
    document.getElementById('pomoLabel').textContent=labels[mins]||'Focus';
  });
});
function setPomoMode(mins) {
  clearInterval(pomoInterval); pomoRunning=false;
  pomoTotal=mins*60; pomoRemaining=mins*60;
  document.getElementById('pomoStartBtn').textContent='▶ Start';
  updatePomoDisplay();
}
function togglePomodoro() {
  if (pomoRunning) {
    clearInterval(pomoInterval); pomoRunning=false;
    document.getElementById('pomoStartBtn').textContent='▶ Start';
  } else {
    pomoRunning=true;
    document.getElementById('pomoStartBtn').textContent='⏸ Pause';
    pomoInterval=setInterval(()=>{
      pomoRemaining--;
      updatePomoDisplay();
      if (pomoRemaining<=0) {
        clearInterval(pomoInterval); pomoRunning=false;
        document.getElementById('pomoStartBtn').textContent='▶ Start';
        if (pomoMode===25) { pomoSessions++; document.getElementById('pomoSessions').textContent=pomoSessions; }
        toast('⏰ Session complete! Take a break.','success');
        setPomoMode(pomoMode);
      }
    },1000);
  }
}
function resetPomodoro() {
  clearInterval(pomoInterval); pomoRunning=false;
  document.getElementById('pomoStartBtn').textContent='▶ Start';
  pomoRemaining=pomoTotal;
  updatePomoDisplay();
}
function updatePomoDisplay() {
  const m=Math.floor(pomoRemaining/60).toString().padStart(2,'0');
  const s=(pomoRemaining%60).toString().padStart(2,'0');
  document.getElementById('pomoTime').textContent=`${m}:${s}`;
  const pct=Math.round((1-pomoRemaining/pomoTotal)*100);
  document.getElementById('pomodoroDisplay').style.setProperty('--pct',pct+'%');
}

// ===== SETTINGS =====
function saveSetting(key, val) {
  state.settings[key]=val; saveState();
}

function clearAllData() {
  if (!confirm('Clear ALL data? This cannot be undone.')) return;
  state={tasks:[],subjects:[],goals:[],scheduleEvents:[],settings:{name:'',semester:''},pomodoro:{sessions:0},activeFilter:'all',editingTaskId:null,editingSubjectId:null};
  saveState(); renderAll();
  toast('All data cleared.','info');
}
function loadSettings() {
  const n=document.getElementById('settingName');
  const s=document.getElementById('settingSemester');
  if (n) n.value=state.settings.name||'';
  if (s) s.value=state.settings.semester||'';
}

// ===== MODAL HELPERS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(m=>{
  m.addEventListener('click',function(e){
    if (e.target===this) this.classList.remove('open');
  });
});
document.addEventListener('keydown',e=>{
  if (e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
});

// ===== RENDER ALL =====
function renderAll() {
  renderDashboard();
  renderTasks();
  renderSubjects();
  renderGoals();
  loadSettings();
}

// ================================================================
// ===== FORM VALIDATION DEMO =====
// ================================================================

// Populate subjects in the demo form
function populateFormSubjects() {
  const sel = document.getElementById('fSubject');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select —</option>';
  state.subjects.forEach(s => {
    sel.innerHTML += `<option value="${s.id}">${s.emoji||'📚'} ${s.name}</option>`;
  });
}

// Validation rules for each field
function validateFormField(fieldId) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + 'Err');
  let valid = true;
  let msg = '';

  switch (fieldId) {
    case 'fName':
      valid = el.value.trim().length >= 2;
      msg = 'Please enter your name (min 2 characters).';
      break;
    case 'fEmail':
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      msg = 'Enter a valid email (e.g. name@domain.com).';
      break;
    case 'fDate':
      valid = el.value !== '';
      msg = 'Study date is required.';
      break;
    case 'fHours': {
      const h = parseFloat(el.value);
      valid = !isNaN(h) && h >= 0.5 && h <= 24;
      msg = 'Enter hours between 0.5 and 24.';
      break;
    }
    case 'fSubject':
      valid = el.value !== '';
      msg = 'Please select a subject.';
      break;
    case 'fTopics':
      valid = el.value.trim().length >= 5;
      msg = 'Please describe what you studied (min 5 characters).';
      break;
    case 'fAgree':
      valid = el.checked;
      msg = 'You must confirm before submitting.';
      break;
  }

  if (!valid) {
    el.classList.add('error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
  } else {
    el.classList.remove('error');
    if (errEl) errEl.classList.remove('show');
  }
  return valid;
}

// Real-time validation on input/blur
function setupRealtimeValidation() {
  const fields = ['fName','fEmail','fDate','fHours','fSubject','fTopics','fAgree'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    // Validate on blur (when user leaves the field)
    el.addEventListener('blur', () => validateFormField(id));
    // Validate on input for immediate feedback (after first interaction)
    el.addEventListener('input', () => {
      if (el.classList.contains('error') || (id === 'fAgree')) {
        validateFormField(id);
      }
    });
    el.addEventListener('change', () => validateFormField(id));
  });
}

// Form submit handler — demonstrates full validation
function handleFormSubmit(e) {
  e.preventDefault();
  const fields = ['fName','fEmail','fDate','fHours','fSubject','fTopics','fAgree'];
  let allValid = true;
  fields.forEach(id => {
    if (!validateFormField(id)) allValid = false;
  });

  const resultEl = document.getElementById('formResult');
  if (!resultEl) return;

  if (allValid) {
    const name = document.getElementById('fName').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const date = document.getElementById('fDate').value;
    const hours = document.getElementById('fHours').value;
    const subjectSel = document.getElementById('fSubject');
    const subjectName = subjectSel.options[subjectSel.selectedIndex]?.text || subjectSel.value;
    const difficulty = document.getElementById('fDifficulty').value;
    const topics = document.getElementById('fTopics').value.trim();

    resultEl.style.display = 'block';
    resultEl.className = 'form-result success';
    resultEl.innerHTML = `
      <strong>✅ Study Log Submitted Successfully!</strong><br>
      <strong>Form Validation Passed.</strong> All fields validated using:
      <code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:0.75rem;">getElementById()</code>,
      <code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:0.75rem;">addEventListener()</code>,
      and custom validation rules.<br><br>
      📄 <strong>Summary:</strong><br>
      👤 ${name} · 📧 ${email}<br>
      📅 ${formatDate(date)} · ⏱ ${hours}h · 📚 ${subjectName}<br>
      📝 ${topics}<br>
      ${difficulty === 'easy' ? '🟢' : difficulty === 'hard' ? '🔴' : '🟡'} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    `;
    // Scroll to result
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showFormToast('Study log saved!', 'success');
  } else {
    resultEl.style.display = 'block';
    resultEl.className = 'form-result error';
    resultEl.innerHTML = '<strong>❌ Form has errors.</strong> Please fix the highlighted fields and try again.';
    // Focus first invalid field
    const firstError = document.querySelector('#studyForm .form-input.error, #studyForm .form-select.error');
    if (firstError) firstError.focus();
  }
}

function showFormToast(msg, type) {
  // Use existing toast function or create a simple one
  if (typeof toast === 'function') {
    toast(msg, type);
  }
}

// Reset form handler
function resetForm() {
  document.getElementById('studyForm').reset();
  document.querySelectorAll('#studyForm .form-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('#studyForm .form-input, #studyForm .form-select').forEach(el => el.classList.remove('error'));
  document.getElementById('formResult').style.display = 'none';
  // Set default date
  document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
}

// ================================================================
// ===== DESTRUCTURING & COPY DEMOS =====
// ================================================================

function demoArrayDestruct() {
  // Array Destructuring - swapping, rest, skip
  const numbers = [10, 20, 30, 40, 50];
  const [a, b, ...rest] = numbers;
  // Also demonstrate swapping
  let x = 5, y = 10;
  [x, y] = [y, x];

  const out = document.getElementById('outArrayDestruct');
  out.innerHTML = `
<span class="highlight">Array Destructuring:</span>
const [a, b, ...rest] = [10, 20, 30, 40, 50];
→ a = <span class="highlight3">${a}</span>, b = <span class="highlight3">${b}</span>, rest = [<span class="highlight3">${rest.join(', ')}</span>]

<span class="highlight">Swapping with destructuring:</span>
let x=5, y=10; [x, y] = [y, x];
→ x = <span class="highlight3">${x}</span>, y = <span class="highlight3">${y}</span>

<span class="highlight">Skipping elements:</span>
const [first, , third] = [10, 20, 30];
→ first = <span class="highlight3">10</span>, third = <span class="highlight3">30</span>  (second skipped)
  `;
}

function demoObjectDestruct() {
  // Object Destructuring
  const student = { name: 'Shreya', age: 20, course: 'FEE', semester: 2 };
  const { name, age, ...rest } = student;
  // Nested destructuring
  const person = { id: 1, address: { city: 'Delhi', country: 'India' } };
  const { address: { city, country } } = person;
  // Default values
  const { score = 100 } = student;

  const out = document.getElementById('outObjectDestruct');
  out.innerHTML = `
<span class="highlight">Object Destructuring:</span>
const {name, age, ...rest} = {name:"Shreya", age:20, course:"FEE", semester:2};
→ name = <span class="highlight3">"${name}"</span>, age = <span class="highlight3">${age}</span>
→ rest = <span class="highlight3">${JSON.stringify(rest)}</span>

<span class="highlight">Nested Destructuring:</span>
const {address: {city, country}} = {id:1, address:{city:"Delhi", country:"India"}};
→ city = <span class="highlight3">"${city}"</span>, country = <span class="highlight3">"${country}"</span>

<span class="highlight">Default Values:</span>
const {score = 100} = student;
→ score = <span class="highlight3">${score}</span> (uses default since not in object)
  `;
}

function demoCopy() {
  // Shallow Copy vs Deep Copy
  const original = { a: 1, b: { c: 2, d: [3, 4] } };

  // Shallow copy using spread
  const shallowCopy = { ...original };
  // Deep copy using JSON (method 1)
  const deepCopy = JSON.parse(JSON.stringify(original));
  // Deep copy using structuredClone (method 2 - modern browsers)
  let deepCopy2;
  try { deepCopy2 = structuredClone(original); } catch(e) { deepCopy2 = JSON.parse(JSON.stringify(original)); }

  // Modify nested property to show the difference
  shallowCopy.b.c = 999;  // This ALSO changes original.b.c because shallow copy shares nested references
  deepCopy.b.c = 777;     // This does NOT affect original

  const out = document.getElementById('outCopy');
  out.innerHTML = `
<span class="highlight">Shallow Copy vs Deep Copy</span>
const original = { a: 1, b: { c: 2, d: [3, 4] } };

<span class="highlight2">After modifying shallowCopy.b.c = 999:</span>
original.b.c = <span class="highlight3">${original.b.c}</span> ← ⚠️ Changed! (shallow copy shares nested refs)
shallowCopy.b.c = <span class="highlight3">999</span>

<span class="highlight2">After modifying deepCopy.b.c = 777:</span>
original.b.c = <span class="highlight3">${original.b.c}</span> ← ✅ Unchanged! (deep copy is independent)
deepCopy.b.c = <span class="highlight3">777</span>

<span class="highlight">💡 Key Difference:</span>
• <strong>Shallow copy</strong> ({...obj}) — nested objects are still <em>referenced</em>, not cloned
• <strong>Deep copy</strong> (JSON.parse(JSON.stringify())) — everything is cloned independently
• <strong>structuredClone()</strong> — modern native deep cloning (supports more types)
  `;
}

// ================================================================
// ===== JSON HANDLING DEMOS =====
// ================================================================

function getJsonInput() {
  const el = document.getElementById('jsonInput');
  if (!el) return null;
  try {
    // Use eval-like parsing to handle unquoted keys (JS object literal syntax)
    return eval('(' + el.value + ')');
  } catch(e) {
    return null;
  }
}

function demoStringify() {
  const obj = getJsonInput();
  const out = document.getElementById('outJson');
  if (obj === null) {
    out.innerHTML = '<span class="highlight3">❌ Invalid JavaScript object syntax. Check your input.</span>';
    return;
  }

  // JSON.stringify with different parameters
  const pretty = JSON.stringify(obj, null, 2);
  const compact = JSON.stringify(obj);
  const filtered = JSON.stringify(obj, ['name', 'score'], 2); // only include name and score

  out.innerHTML = `
<span class="highlight">JSON.stringify() — JS Object → JSON String</span>

<span class="highlight2">Compact (default):</span>
JSON.stringify(obj) →
<span class="highlight3">${compact}</span>

<span class="highlight2">Pretty-printed (with spacing):</span>
JSON.stringify(obj, null, 2) →
<pre style="background:var(--bg);padding:8px;border-radius:6px;font-size:0.7rem;margin:4px 0;">${pretty.replace(/</g,'&lt;')}</pre>

<span class="highlight2">Filtered (only 'name' & 'score'):</span>
JSON.stringify(obj, ['name', 'score'], 2) →
<span class="highlight3">${filtered.replace(/</g,'&lt;')}</span>
  `;
}

function demoParse() {
  const input = document.getElementById('jsonInput').value.trim();
  const out = document.getElementById('outJson');

  // Try to parse as JSON first (if it's already JSON), otherwise show how parse works
  let isValidJson = false;
  let parsed = null;
  try {
    parsed = JSON.parse(input);
    isValidJson = true;
  } catch(e) {
    // Not valid JSON - try converting JS object to JSON then parsing back
    try {
      const obj = eval('(' + input + ')');
      const jsonStr = JSON.stringify(obj);
      parsed = JSON.parse(jsonStr);
      isValidJson = true;
    } catch(e2) {
      isValidJson = false;
    }
  }

  if (!isValidJson) {
    out.innerHTML = '<span class="highlight3">❌ Cannot parse. Enter a valid object or JSON string.</span>';
    return;
  }

  const jsonStr = JSON.stringify(parsed);

  out.innerHTML = `
<span class="highlight">JSON.parse() — JSON String → JS Object</span>

<span class="highlight2">Original JSON string:</span>
<span class="highlight3">${jsonStr.replace(/</g,'&lt;')}</span>

<span class="highlight2">Parsed JavaScript object:</span>
typeof result: <span class="highlight3">${typeof parsed}</span>

<span class="highlight2">Accessing properties:</span>
${parsed.name ? `parsed.name → <span class="highlight3">"${parsed.name}"</span>` : ''}
${parsed.score !== undefined ? `parsed.score → <span class="highlight3">${parsed.score}</span>` : ''}
<div style="margin-top:6px;">
<strong>💡 Tip:</strong> JSON keys must be in double quotes. Use <strong>JSON.stringify()</strong> first to convert JS → JSON.
</div>
  `;
}

function clearJsonOutput() {
  document.getElementById('outJson').innerHTML = '';
}

// ================================================================
// ===== DOM MANIPULATION DEMOS =====
// ================================================================

function demoGetElementById() {
  const out = document.getElementById('outDomSelectors');
  // getElementById demo
  const title = document.getElementById('jsLabCard');
  const box1 = document.getElementById('domBox1');
  const box2 = document.getElementById('domBox2');

  out.innerHTML = `
<span class="highlight">getElementById()</span>
document.getElementById('domBox1') →
<span class="highlight3">${box1 ? box1.outerHTML.replace(/</g,'&lt;').slice(0,80)+'...' : 'null'}</span>

document.getElementById('domBox2') →
<span class="highlight3">${box2 ? box2.outerHTML.replace(/</g,'&lt;').slice(0,80)+'...' : 'null'}</span>

<strong>💡</strong> Returns a <strong>single element</strong> by its ID (fastest selector).
  `;
}

function demoQuerySelector() {
  const out = document.getElementById('outDomSelectors');
  // querySelector demo - first match
  const firstBox = document.querySelector('.dom-box');
  const firstLi = document.querySelector('.delegation-list li');
  const firstBtn = document.querySelector('.js-run-btn');

  out.innerHTML = `
<span class="highlight">querySelector()</span>
document.querySelector('.dom-box') →
<span class="highlight3">${firstBox ? firstBox.textContent.trim() : 'null'}</span> (first match)

document.querySelector('.delegation-list li') →
<span class="highlight3">${firstLi ? firstLi.textContent.trim() : 'null'}</span> (first &lt;li&gt;)

document.querySelector('.js-run-btn') →
<span class="highlight3">"${firstBtn ? firstBtn.textContent.trim() : 'null'}"</span>

<strong>💡</strong> Returns the <strong>first matching element</strong> using any CSS selector.
  `;
}

function demoQuerySelectorAll() {
  const out = document.getElementById('outDomSelectors');
  // querySelectorAll demo
  const allBoxes = document.querySelectorAll('.dom-box');
  const allDetails = document.querySelectorAll('.js-lab-details');
  const allButtons = document.querySelectorAll('.btn-sm');

  out.innerHTML = `
<span class="highlight">querySelectorAll()</span>
document.querySelectorAll('.dom-box') →
<span class="highlight3">${allBoxes.length} elements</span> found

document.querySelectorAll('.js-lab-details') →
<span class="highlight3">${allDetails.length} elements</span> found (5 topics)

document.querySelectorAll('.btn-sm') →
<span class="highlight3">${allButtons.length} elements</span> found

<strong>💡</strong> Returns a <strong>NodeList</strong> of ALL matching elements. Use .forEach() to iterate.
  `;
}

function demoChangeHtml() {
  // read & write HTML through JavaScript
  const box1 = document.getElementById('domBox1');
  const currentHtml = box1 ? box1.innerHTML : '';
  box1.innerHTML = '✨ Modified via <strong>innerHTML</strong>!';
  const out = document.getElementById('outDomAction');
  out.innerHTML = `
<span class="highlight">Reading & Writing HTML</span>
<strong>Read:</strong> box1.innerHTML <span class="highlight3">→ "${currentHtml.replace(/</g,'&lt;')}"</span>
<strong>Write:</strong> box1.innerHTML = '✨ Modified via <strong>innerHTML</strong>!' ✓
<div style="margin-top:6px;">✅ Box 1 content changed using <code style="background:var(--bg);padding:2px 6px;border-radius:4px;">element.innerHTML</code></div>
  `;
}

function demoChangeCss() {
  // read & write CSS through JavaScript
  const box2 = document.getElementById('domBox2');
  const currentBg = box2 ? box2.style.background : '';
  box2.style.background = 'linear-gradient(135deg, #ff6b8a, #ff9ab3)';
  box2.style.color = '#fff';
  box2.style.transform = 'scale(1.05)';
  box2.style.border = '2px solid #ff6b8a';
  const out = document.getElementById('outDomAction');
  out.innerHTML = `
<span class="highlight">Reading & Writing CSS</span>
<strong>Write:</strong> box2.style.background = 'linear-gradient(...)'
box2.style.transform = 'scale(1.05)'
box2.style.color = '#fff'
<div style="margin-top:6px;">✅ Box 2 styles changed using <code style="background:var(--bg);padding:2px 6px;border-radius:4px;">element.style.property</code></div>
  `;
}

function demoCreateNode() {
  // Creating, appending nodes
  const playground = document.getElementById('domPlayground');
  const newBox = document.createElement('div');
  newBox.className = 'dom-box-added';
  newBox.textContent = '🆕 Created at ' + new Date().toLocaleTimeString();
  playground.appendChild(newBox);
  const out = document.getElementById('outDomAction');
  out.innerHTML = `
<span class="highlight">Creating & Appending Nodes</span>
const newBox = <strong>document.createElement('div')</strong>
newBox.textContent = '🆕 New Node'
playground.<strong>appendChild</strong>(newBox)
<div style="margin-top:6px;">✅ Created a new &lt;div&gt; element and appended it to the DOM playground.</div>
  `;
}

function demoDeleteNode() {
  // Deleting nodes
  const playground = document.getElementById('domPlayground');
  const addedBoxes = playground.querySelectorAll('.dom-box-added');
  if (addedBoxes.length > 0) {
    const last = addedBoxes[addedBoxes.length - 1];
    const removedText = last.textContent;
    last.remove(); // Modern way: element.remove()
    // Alternative: playground.removeChild(last); // Traditional way
    const out = document.getElementById('outDomAction');
    out.innerHTML = `
<span class="highlight">Deleting Nodes</span>
const el = playground.querySelector('.dom-box-added:last-child')
el.<strong>remove()</strong>  (or playground.removeChild(el))
<div style="margin-top:6px;">✅ Removed "${removedText}" from the DOM playground.</div>
    `;
  } else {
    const out = document.getElementById('outDomAction');
    out.innerHTML = '<span class="highlight3">⚠️ No added nodes to delete. Click "Create Node" first.</span>';
  }
}

function demoResetDom() {
  const playground = document.getElementById('domPlayground');
  // Remove added nodes
  playground.querySelectorAll('.dom-box-added').forEach(el => el.remove());
  // Reset box 1
  const box1 = document.getElementById('domBox1');
  if (box1) {
    box1.innerHTML = '🟪 Box 1';
    box1.style.background = '';
    box1.style.color = '';
    box1.style.transform = '';
    box1.style.border = '';
  }
  // Reset box 2
  const box2 = document.getElementById('domBox2');
  if (box2) {
    box2.innerHTML = '🟨 Box 2';
    box2.style.background = '';
    box2.style.color = '';
    box2.style.transform = '';
    box2.style.border = '';
  }
  const out = document.getElementById('outDomAction');
  out.innerHTML = '<span class="highlight">↺ DOM Playground reset to initial state.</span>';
}

// ================================================================
// ===== EVENT HANDLING DEMOS =====
// ================================================================

// Event Bubbling — inner -> middle -> outer
function setupBubbling() {
  const outEl = document.getElementById('outBubble');
  outEl.innerHTML = '<span class="highlight2">🔄 Bubbling mode active! Click the colored boxes below.</span>';

  const outer = document.getElementById('bubbleOuter');
  const mid = document.getElementById('bubbleMid');
  const inner = document.getElementById('bubbleInner');

  // Remove old listeners first (clone and replace to prevent duplicates)
  [outer, mid, inner].forEach(el => {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });

  // Re-query after replacement
  const newOuter = document.getElementById('bubbleOuter');
  const newMid = document.getElementById('bubbleMid');
  const newInner = document.getElementById('bubbleInner');

  // Add bubbling listeners (default: bubble phase)
  newInner.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟥 Inner clicked (1st) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  });

  newMid.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟦 Mid clicked (2nd) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  });

  newOuter.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟩 Outer clicked (3rd) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  });

  outEl.innerHTML += '\n<span class="highlight3">✅ Listeners attached (bubble phase). Click Inner → Mid → Outer propagates!</span>';
  outEl.scrollTop = outEl.scrollHeight;
}

// Event Capturing — outer -> middle -> inner
function setupCapturing() {
  const outEl = document.getElementById('outBubble');
  outEl.innerHTML = '<span class="highlight2">🔄 Capturing mode active! Click the colored boxes below.</span>';

  const outer = document.getElementById('bubbleOuter');
  const mid = document.getElementById('bubbleMid');
  const inner = document.getElementById('bubbleInner');

  // Remove old listeners first
  [outer, mid, inner].forEach(el => {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });

  // Re-query
  const newOuter = document.getElementById('bubbleOuter');
  const newMid = document.getElementById('bubbleMid');
  const newInner = document.getElementById('bubbleInner');

  // Add capturing listeners (third argument: true)
  newOuter.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟩 Outer caught (1st - capturing!) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  }, true);

  newMid.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟦 Mid caught (2nd - capturing!) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  }, true);

  newInner.addEventListener('click', function(e) {
    this.classList.add('clicked');
    outEl.innerHTML += `\n🟥 Inner caught (3rd - capturing!) — ${this.textContent.trim()}`;
    setTimeout(() => this.classList.remove('clicked'), 300);
  }, true);

  outEl.innerHTML += '\n<span class="highlight3">✅ Listeners attached (capture phase). Outer → Mid → Inner propagates!</span>';
  outEl.scrollTop = outEl.scrollHeight;
}

// Event Delegation Demo
let delegationCounter = 3;

function setupDelegation() {
  const list = document.getElementById('delegationList');
  if (!list) return;

  // Use event delegation — ONE listener for ALL list items
  list.addEventListener('click', function(e) {
    const li = e.target.closest('li');
    if (!li) return;
    // Highlight the clicked item
    document.querySelectorAll('.delegation-list li').forEach(l => l.classList.remove('highlighted'));
    li.classList.add('highlighted');
    const out = document.getElementById('outDelegation');
    out.innerHTML = `
<span class="highlight">Event Delegation in action!</span>
Clicked: <span class="highlight3">"${li.textContent.trim()}"</span>
Target: <span class="highlight3">&lt;li&gt;</span>
Listener is on: <span class="highlight3">&lt;ul id="delegationList"&gt;</span>

<strong>💡</strong> ONE event listener on the parent &lt;ul&gt; handles ALL &lt;li&gt; clicks — even dynamically added ones!
This is <strong>Event Delegation</strong> — works via event bubbling.
    `;
  });
}

function addDelegationItem() {
  const list = document.getElementById('delegationList');
  delegationCounter++;
  const items = ['📘 Complete DBMS Project', '📗 Review FEE Notes', '📕 Practice DSA Problems', '📙 Prepare for Quiz', '📓 Update Study Planner'];
  const li = document.createElement('li');
  li.textContent = items[(delegationCounter - 4) % items.length] + ` (${delegationCounter})`;
  list.appendChild(li);
  const out = document.getElementById('outDelegation');
  out.innerHTML = `<span class="highlight3">✅ New item added dynamically. Click it — the delegate listener handles it!</span>`;
}

function demoDelegation() {
  const out = document.getElementById('outDelegation');
  out.innerHTML = `
<span class="highlight">Event Delegation Explained</span>

<strong>Without delegation</strong> — you'd need .addEventListener() on EACH &lt;li&gt;
→ New items wouldn't have the listener!

<strong>With delegation</strong> — ONE listener on parent &lt;ul&gt;
→ All existing &amp; future &lt;li&gt; clicks are handled!

<span class="highlight3">✅ Click any list item above to see it in action. Add new items and click them too!</span>
  `;
}

// ================================================================
// ===== BOM — BROWSER OBJECT MODEL DEMOS =====
// ================================================================

function demoNavigator() {
  const out = document.getElementById('outBomInfo');
  out.innerHTML = `
<span class="highlight">🌐 window.navigator</span>
navigator.userAgent: <span class="highlight3">${navigator.userAgent.slice(0,100)}...</span>
navigator.language: <span class="highlight3">${navigator.language}</span>
navigator.platform: <span class="highlight3">${navigator.platform}</span>
navigator.onLine: <span class="highlight3">${navigator.onLine}</span>
navigator.cookieEnabled: <span class="highlight3">${navigator.cookieEnabled}</span>
${navigator.geolocation ? 'navigator.geolocation: <span class="highlight3">✅ Available</span>' : ''}
  `;
}

function demoLocation() {
  const out = document.getElementById('outBomInfo');
  out.innerHTML = `
<span class="highlight">📍 window.location</span>
location.href: <span class="highlight3">${location.href}</span>
location.hostname: <span class="highlight3">${location.hostname}</span>
location.pathname: <span class="highlight3">${location.pathname}</span>
location.protocol: <span class="highlight3">${location.protocol}</span>
location.port: <span class="highlight3">"${location.port}"</span>
location.search: <span class="highlight3">"${location.search || '(none)'}"</span>
  `;
}

let timerInterval = null;
let timerCount = 0;

function demoSetTimeout() {
  const out = document.getElementById('outTimer');
  out.innerHTML = '<span class="highlight2">⏲ setTimeout() fired! Waiting 2 seconds...</span>';
  setTimeout(() => {
    out.innerHTML = '<span class="highlight3">✅ setTimeout() complete — 2 seconds have passed!</span>';
  }, 2000);
}

function demoSetInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerCount = 0;
  }
  const display = document.getElementById('timerDisplay');
  const out = document.getElementById('outTimer');
  timerCount = 0;
  display.textContent = '0';
  out.innerHTML = '<span class="highlight2">🔁 setInterval() started — counting every 1 second...</span>';

  timerInterval = setInterval(() => {
    timerCount++;
    display.textContent = timerCount;
    if (timerCount >= 10) {
      clearInterval(timerInterval);
      timerInterval = null;
      out.innerHTML = '<span class="highlight3">✅ setInterval() stopped after 10 counts.</span>';
      display.textContent = '10';
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    const out = document.getElementById('outTimer');
    out.innerHTML = '<span class="highlight3">⏹ Timer stopped via clearInterval().</span>';
  } else {
    const out = document.getElementById('outTimer');
    out.innerHTML = '<span class="highlight3">⚠️ No active timer to stop.</span>';
  }
}

function demoAlert() {
  window.alert('🧪 This is an alert() dialog!\n\nalert() displays a message with an OK button.\nIt blocks execution until dismissed.');
  const out = document.getElementById('outDialogs');
  out.innerHTML = '<span class="highlight3">✅ alert() was dismissed by user.</span>';
}

function demoConfirm() {
  const result = window.confirm('🧪 This is a confirm() dialog.\n\nClick OK or Cancel to see the result.');
  const out = document.getElementById('outDialogs');
  out.innerHTML = `
<span class="highlight">confirm() result:</span>
User clicked: <span class="highlight3">${result ? '✅ OK' : '❌ Cancel'}</span>
<strong>💡</strong> confirm() returns <strong>true</strong> (OK) or <strong>false</strong> (Cancel).
  `;
}

function demoPrompt() {
  const result = window.prompt('🧪 This is a prompt() dialog.\n\nEnter a message:', 'Hello from BOM!');
  const out = document.getElementById('outDialogs');
  if (result !== null) {
    out.innerHTML = `
<span class="highlight">prompt() result:</span>
You entered: <span class="highlight3">"${result}"</span>
<strong>💡</strong> prompt() returns the input string, or <strong>null</strong> if cancelled.
    `;
  } else {
    out.innerHTML = '<span class="highlight3">❌ Prompt was cancelled (returned null).</span>';
  }
}

// ===== INITIALIZE NEW FEATURES =====
function initNewFeatures() {
  // Form validation setup
  const form = document.getElementById('studyForm');
  if (form) {
    // Set default date
    const dateField = document.getElementById('fDate');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    // Populate subjects
    populateFormSubjects();
    // Real-time validation
    setupRealtimeValidation();
    // Submit handler
    form.addEventListener('submit', handleFormSubmit);
    // Reset handler
    form.addEventListener('reset', resetForm);
  }

  // Event delegation setup
  setupDelegation();
}

// ===== INIT =====
function init() {
  loadState();
  initTheme();
  updateGreeting();
  renderAll();
  renderSchedule();
  updatePomoDisplay();
  setInterval(updateGreeting, 60000);
  // Animate progress bars after a brief delay
  setTimeout(() => {
    document.querySelectorAll('.progress-bar').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => setTimeout(() => bar.style.width = w, 50));
    });
  }, 300);

  // Initialize new features (form validation, JS lab)
  initNewFeatures();
}
init();

let saveTimeout = null;
function setupAutoSave() {
  const saveStateWithDebounce = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveState();
      showAutoSaveIndicator();
    }, 1000); // Save 1 second after last change
  };

  // Watch for changes in form fields
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', saveStateWithDebounce);
    el.addEventListener('change', saveStateWithDebounce);
  });

  // Watch for changes in task/subjects/goals
  window.addEventListener('storage', (e) => {
    if (e.key === 'smartplanner_v1') {
      loadState();
      renderAll();
    }
  });
}

function showAutoSaveIndicator() {
  const indicator = document.getElementById('autosaveIndicator');
  if (indicator) {
    indicator.style.display = 'inline-block';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 1500);
  }
}

// Import/Export functionality
function exportData() {
  window.print();
}



// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('exportDataBtn');
  if (btn) {
    btn.addEventListener('click', exportData);
  }
});
// Import button (hidden until import feature is built)
const importBtn = document.getElementById('importBtn');
if (importBtn) {
  importBtn.addEventListener('click', function() {
    toast('Import feature coming soon.', 'info');
  });
}

// Initialize auto-save when page loads
document.addEventListener('DOMContentLoaded', setupAutoSave);
// ===== EVENT BUBBLING & CAPTURING =====

const outerBox = document.getElementById('outerBox');
const innerBox = document.getElementById('innerBox');
const demoBtn = document.getElementById('demoBtn');

if(outerBox && innerBox && demoBtn){

  outerBox.addEventListener('click', () => {
    console.log('Outer Div Bubbling');
  });

  innerBox.addEventListener('click', () => {
    console.log('Inner Div Bubbling');
  });

  demoBtn.addEventListener('click', () => {
    console.log('Button Clicked');
  });

  // Capturing
  outerBox.addEventListener('click', () => {
    console.log('Outer Div Capturing');
  }, true);

}
// ===== CALLBACK FUNCTION =====

function fetchData(callback){

  setTimeout(() => {

    console.log('Data fetched');

    callback();

  }, 1000);

}

fetchData(function(){

  console.log('Callback executed');

});
// ===== PROMISE =====

const projectPromise = new Promise((resolve, reject) => {

  let projectCompleted = true;

  setTimeout(() => {

    if(projectCompleted){
      resolve('Project Submitted Successfully');
    }
    else{
      reject('Project Failed');
    }

  }, 2000);

});

projectPromise
.then(result => {
  console.log(result);
})
.catch(error => {
  console.log(error);
});
// ===== EVENT DELEGATION =====

document.addEventListener('click', function(e){

  if(e.target.classList.contains('dynamic-task-btn')){

    alert('Dynamic Task Clicked');

  }

});
// ===== DEEP COPY & SHALLOW COPY =====

function copyExamples(){

  const originalTask = {
    title:'Frontend Project',
    marks:{
      viva:20
    }
  };

  // Shallow Copy
  const shallowCopy = { ...originalTask };

  // Deep Copy
  const deepCopy =
    JSON.parse(JSON.stringify(originalTask));

  console.log(originalTask);
  console.log(shallowCopy);
  console.log(deepCopy);

}

copyExamples();
// ===== BOM =====

window.addEventListener('load', () => {

  const browserInfo =
    document.getElementById('browserInfo');

  const currentURL =
    document.getElementById('currentURL');

  if(browserInfo){
    browserInfo.innerHTML =
      `Browser: ${navigator.userAgent}`;
  }

  if(currentURL){
    currentURL.innerHTML =
      `Current URL: ${location.href}`;
  }

});
