// Preset Scenarios Data
const scenarios = {
  human: {
    meta: "Author: Sarah Jenkins (History 201) — Submitted: July 30, 2026",
    text: `The shift from agricultural to factory labor during the Industrial Revolution was not just a change in employment, but a radical transformation of human life and social time. Before the factories, rural workers structured their days around task-based work—weaving on handlooms, farming, following natural seasonal cycles. E.P. Thompson calls this "nature's time."

When factory owners introduced steam-driven machinery in cities like Manchester, they had to force workers into a completely new mindset. Time became a currency: "time is money." Factory discipline was brutal. Employers used fines, bells, and physical intimidation to make sure workers clocked in at exact minutes. The Clock, not the sun, ruled the day. This led to massive protests. For example, the Ten Hours Act of 1847 wasn't just about reducing work hours; it was a battle over who owned a worker's life outside of factory gates. 

In my view, this transition is why we today feel so stressed about schedules. The factory did not just produce textiles; it manufactured the modern worker who views time as a scarce commodity to be bought and sold. While some historians argue technology improved standards of living, for the people experiencing it, it felt like their freedom was being systematically stripped away.`,
    scores: {
      critical: 88,
      structure: 72,
      knowledge: 85
    },
    aiProb: 12,
    feedback: "An insightful essay demonstrating strong critical analysis of primary themes. The connection between rural task-oriented labor and industrial 'clock time' is well-elaborated, drawing effectively on historical concepts. However, the structure could be tighter; the transition between paragraph 2 and the conclusion is slightly abrupt, and some minor grammatical errors exist. Overall, a highly authentic and promising piece of historical analysis."
  },
  ai: {
    meta: "Author: Alex Rivera (History 201) — Submitted: July 30, 2026",
    text: `The Socio-Economic Impact of the Industrial Revolution: A Comprehensive Analysis

Introduction:
The Industrial Revolution, occurring between the late 18th and mid-19th centuries, marked a pivotal turning point in human history. It catalyzed the transition from agrarian economies to industrialized, urban societies. This essay will analyze the socio-economic impacts of this transition, focusing on urbanization, class structures, and labor dynamics.

Socio-Economic Dimensions:
1. Urbanization and Demographics: The rapid expansion of manufacturing attracted rural populations to emerging urban centers. This demographic shift resulted in overcrowded cities characterized by poor sanitation.
2. The Emergence of Class Structures: The era witnessed the bifurcation of society into two primary classes: the bourgeoisie (owners of capital) and the proletariat (wage laborers).
3. Labor Dynamics: Factory systems introduced rigorous work schedules, shifting the paradigm from task-oriented labor to time-oriented discipline.

Conclusion:
In conclusion, the Industrial Revolution was a multi-faceted phenomenon. While it facilitated unprecedented technological advancement and economic growth, it also generated profound social challenges, including labor exploitation and urban squalor. Understanding this historical duality is essential for analyzing modern economic frameworks.`,
    scores: {
      critical: 48,
      structure: 96,
      knowledge: 80
    },
    aiProb: 98,
    feedback: "The submission is exceptionally well-structured, utilizing clear headings, lists, and flawless transitions. However, the analysis is highly generalized and formulaic. It rehashes standard textbook definitions of the Industrial Revolution without engaging in critical historical debates or offering a unique student thesis. The prose displays the typical uniformity and low lexical diversity characteristic of generative language models."
  },
  hybrid: {
    meta: "Author: Liam Chen (History 201) — Submitted: July 30, 2026",
    text: `Technology, Sabotage, and Class Struggle: The Luddite Response to Industrialization

The Luddites are often misremembered as simple technophobes who hated progress. However, a closer look at the uprisings between 1811 and 1816 reveals a highly targeted political struggle. They were not fighting the machines themselves, but the 'fraudulent and deceitful practices' of factory owners who used machines to bypass standard apprenticeship laws and depress wages.

This struggle highlights a core conflict:
- Skill vs. Standardized Labor: Machines allowed unskilled, low-paid workers (often children) to do the work of skilled artisans.
- Price vs. Quality: Handloom weavers took pride in their craft, whereas steam looms produced cheaper, lower-quality goods at high volume.
- Community vs. Capitalism: The destruction of frames was a community-supported defense of a way of life, not just random vandalism.

The British government responded with extreme force, deploying more troops to northern England than to the Iberian Peninsula during the Napoleonic Wars. Frame breaking was made a capital offense. This militarization shows how vital factory machinery was to the state's economic plans. I believe the Luddite movement was a rational response to a system that was actively devaluing human labor. Their concerns about technology replacing human dignity remain incredibly relevant in today's digital age.`,
    scores: {
      critical: 78,
      structure: 85,
      knowledge: 80
    },
    aiProb: 44,
    feedback: "A strong, well-argued essay that frames the Luddite rebellion through a political lens rather than simple technophobia. The student provides solid historical analysis and draws a relevant parallel to modern tech. Some sections (particularly the bulleted summary) display a highly symmetrical, AI-assisted layout, suggesting the use of LLMs for structural editing. However, the core arguments and distinct student voice remain authentic and well-supported."
  }
};

// State Variables
let currentScenario = 'human';
let assessmentRunning = false;
let assessmentComplete = false;

// DOM Elements
const textarea = document.getElementById('submission-text');
const charCount = document.getElementById('char-count');
const studentMeta = document.getElementById('student-meta');
const tabButtons = document.querySelectorAll('.tab-btn');
const runBtn = document.getElementById('run-assessment-btn');
const scanOverlay = document.getElementById('scan-overlay');

// AI Elements
const safetyMonitor = document.getElementById('safety-monitor');
const safetyGauge = document.getElementById('safety-gauge');
const safetyDesc = document.getElementById('safety-status-desc');
const safetyWarning = document.getElementById('safety-warning-banner');

const aiScoreCritical = document.getElementById('ai-score-critical');
const aiScoreStructure = document.getElementById('ai-score-structure');
const aiScoreKnowledge = document.getElementById('ai-score-knowledge');
const aiBarCritical = document.getElementById('ai-bar-critical');
const aiBarStructure = document.getElementById('ai-bar-structure');
const aiBarKnowledge = document.getElementById('ai-bar-knowledge');
const aiFeedbackBox = document.getElementById('ai-feedback-box');

// Faculty Elements
const sliderCritical = document.getElementById('slider-critical');
const sliderStructure = document.getElementById('slider-structure');
const sliderKnowledge = document.getElementById('slider-knowledge');
const valCritical = document.getElementById('faculty-val-critical');
const valStructure = document.getElementById('faculty-val-structure');
const valKnowledge = document.getElementById('faculty-val-knowledge');
const facultyFeedbackBox = document.getElementById('faculty-feedback-box');
const approveBtn = document.getElementById('approve-grade-btn');
const statusMsg = document.getElementById('system-status-msg');
const logList = document.getElementById('log-list');

// Dialog Elements
const explainerDialog = document.getElementById('explainer-dialog');
const openExplainerBtn = document.getElementById('open-explainer-btn');
const closeExplainerBtn = document.getElementById('close-explainer-btn');

// Drawer Elements
const presenterGuide = document.getElementById('presenter-guide');
const toggleGuideBtn = document.getElementById('toggle-guide-btn');
const closeGuideBtn = document.getElementById('close-guide-btn');

// Initialize App
function init() {
  loadScenario(currentScenario);
  
  // Set up character counter
  textarea.addEventListener('input', () => {
    updateCharCount(textarea.value);
  });

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (assessmentRunning) return;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScenario = btn.dataset.scenario;
      loadScenario(currentScenario);
    });
  });

  // Run Assessment
  runBtn.addEventListener('click', runSimulation);

  // Faculty Adjustments
  setupSliderListener(sliderCritical, valCritical);
  setupSliderListener(sliderStructure, valStructure);
  setupSliderListener(sliderKnowledge, valKnowledge);

  // Faculty Approve
  approveBtn.addEventListener('click', approveGrade);

  // Dialog & Drawer
  setupDialog();
  setupDrawer();
}

// Load Selected Scenario
function loadScenario(key) {
  const data = scenarios[key];
  textarea.value = data.text;
  studentMeta.textContent = data.meta;
  updateCharCount(data.text);
  resetAssessmentDisplay();
}

// Update Character Count
function updateCharCount(text) {
  charCount.textContent = `${text.length} chars`;
}

// Reset UI back to un-assessed state
function resetAssessmentDisplay() {
  assessmentComplete = false;
  
  // Reset AI progress bars
  aiBarCritical.style.width = '0%';
  aiBarStructure.style.width = '0%';
  aiBarKnowledge.style.width = '0%';
  aiScoreCritical.textContent = '--';
  aiScoreStructure.textContent = '--';
  aiScoreKnowledge.textContent = '--';
  
  // Reset AI Feedback
  aiFeedbackBox.textContent = 'Click "Run AI Assessment" to generate draft scores and feedback.';
  aiFeedbackBox.className = 'ai-feedback-placeholder';
  
  // Reset Safety Gauges
  safetyGauge.style.width = '0%';
  safetyDesc.innerHTML = 'GenAI Authorship Probability: <strong>--</strong>';
  safetyMonitor.className = 'safety-card safety-pass';
  safetyWarning.classList.add('hidden');
  
  // Reset Faculty Panel
  sliderCritical.disabled = true;
  sliderStructure.disabled = true;
  sliderKnowledge.disabled = true;
  facultyFeedbackBox.disabled = true;
  approveBtn.disabled = true;
  
  sliderCritical.value = 70;
  sliderStructure.value = 70;
  sliderKnowledge.value = 70;
  valCritical.textContent = '--';
  valStructure.textContent = '--';
  valKnowledge.textContent = '--';
  facultyFeedbackBox.value = '';
  
  statusMsg.textContent = '';
}

// Simulate AI grading execution
function runSimulation() {
  if (assessmentRunning) return;
  
  assessmentRunning = true;
  scanOverlay.classList.remove('hidden');
  resetAssessmentDisplay();
  
  setTimeout(() => {
    scanOverlay.classList.add('hidden');
    assessmentRunning = false;
    assessmentComplete = true;
    
    populateAIAssessment(currentScenario);
  }, 2000);
}

// Show AI evaluation results on screen
function populateAIAssessment(key) {
  const data = scenarios[key];
  
  // Update AI integrity gauge
  safetyGauge.style.width = `${data.aiProb}%`;
  
  if (data.aiProb > 75) {
    safetyMonitor.className = 'safety-card safety-warning';
    safetyDesc.innerHTML = `GenAI Authorship Probability: <strong style="color: var(--accent-rose);">${data.aiProb}% (HIGH RISK)</strong>`;
    safetyWarning.classList.remove('hidden');
  } else if (data.aiProb > 30) {
    safetyMonitor.className = 'safety-card';
    safetyMonitor.style.background = 'rgba(245, 158, 11, 0.05)';
    safetyMonitor.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    safetyDesc.innerHTML = `GenAI Authorship Probability: <strong style="color: var(--accent-amber);">${data.aiProb}% (MODERATE RISK)</strong>`;
    safetyWarning.classList.add('hidden');
  } else {
    safetyMonitor.className = 'safety-card safety-pass';
    safetyMonitor.style.background = '';
    safetyMonitor.style.border = '';
    safetyDesc.innerHTML = `GenAI Authorship Probability: <strong style="color: var(--accent-emerald);">${data.aiProb}% (LOW RISK)</strong>`;
    safetyWarning.classList.add('hidden');
  }
  
  // Animate Rubric Scores
  setTimeout(() => {
    aiBarCritical.style.width = `${data.scores.critical}%`;
    aiScoreCritical.textContent = `${data.scores.critical}/100`;
  }, 200);

  setTimeout(() => {
    aiBarStructure.style.width = `${data.scores.structure}%`;
    aiScoreStructure.textContent = `${data.scores.structure}/100`;
  }, 400);

  setTimeout(() => {
    aiBarKnowledge.style.width = `${data.scores.knowledge}%`;
    aiScoreKnowledge.textContent = `${data.scores.knowledge}/100`;
  }, 600);

  // Typewriter effect for feedback
  aiFeedbackBox.className = 'active-feedback';
  aiFeedbackBox.textContent = '';
  let i = 0;
  const typeSpeed = 5; // fast typing
  
  function typeWriter() {
    if (i < data.feedback.length) {
      aiFeedbackBox.textContent += data.feedback.charAt(i);
      i++;
      setTimeout(typeWriter, typeSpeed);
    } else {
      // Enable Faculty controls when AI finishes drafting
      enableFacultyControls(data);
    }
  }
  
  setTimeout(typeWriter, 800);
}

// Enable Faculty Oversight fields
function enableFacultyControls(data) {
  sliderCritical.disabled = false;
  sliderStructure.disabled = false;
  sliderKnowledge.disabled = false;
  facultyFeedbackBox.disabled = false;
  
  // Set values to match AI draft
  sliderCritical.value = data.scores.critical;
  sliderStructure.value = data.scores.structure;
  sliderKnowledge.value = data.scores.knowledge;
  
  valCritical.textContent = `${data.scores.critical}/100`;
  valStructure.textContent = `${data.scores.structure}/100`;
  valKnowledge.textContent = `${data.scores.knowledge}/100`;
  
  facultyFeedbackBox.value = data.feedback;
  
  // Lock Submit if AI-on-AI loop risk is critical
  // This demonstrates that the system stops AI-on-AI grading without manual override
  if (data.aiProb > 75) {
    approveBtn.disabled = true;
    approveBtn.innerHTML = `<span class="btn-icon">🔒</span> Review Required (AI Work Detected)`;
    
    // Add event listener to final feedback or slider to unlock once user edits something
    const unlockOnAction = () => {
      approveBtn.disabled = false;
      approveBtn.innerHTML = `<span class="btn-icon">✔️</span> Override AI &amp; Release Feedback`;
      approveBtn.classList.add('btn-override-active');
      facultyFeedbackBox.removeEventListener('input', unlockOnAction);
      sliderCritical.removeEventListener('input', unlockOnAction);
      sliderStructure.removeEventListener('input', unlockOnAction);
      sliderKnowledge.removeEventListener('input', unlockOnAction);
    };
    
    facultyFeedbackBox.addEventListener('input', unlockOnAction);
    sliderCritical.addEventListener('input', unlockOnAction);
    sliderStructure.addEventListener('input', unlockOnAction);
    sliderKnowledge.addEventListener('input', unlockOnAction);
  } else {
    approveBtn.disabled = false;
    approveBtn.innerHTML = `<span class="btn-icon">✔️</span> Approve &amp; Release Feedback`;
    approveBtn.className = 'btn btn-approve';
  }
}

// Setup input listeners for faculty override sliders
function setupSliderListener(slider, label) {
  slider.addEventListener('input', () => {
    label.textContent = `${slider.value}/100`;
    label.style.color = 'var(--accent-indigo)';
  });
}

// Release and Log Grade
function approveGrade() {
  const finalCritical = parseInt(sliderCritical.value);
  const finalStructure = parseInt(sliderStructure.value);
  const finalKnowledge = parseInt(sliderKnowledge.value);
  const avg = Math.round((finalCritical + finalStructure + finalKnowledge) / 3);
  
  // Get student name
  let name = "Sarah Jenkins";
  let flagged = false;
  if (currentScenario === 'ai') {
    name = "Alex Rivera";
    flagged = true;
  } else if (currentScenario === 'hybrid') {
    name = "Liam Chen";
  }

  // Visual confirmation
  statusMsg.textContent = "✔️ Assessment finalized and synced to LMS!";
  approveBtn.disabled = true;
  
  // Add to Activity Log
  const logList = document.getElementById('log-list');
  const emptyLog = logList.querySelector('.empty-log');
  if (emptyLog) emptyLog.remove();
  
  const li = document.createElement('li');
  
  let integrityBadge = flagged 
    ? `<span class="log-score ai-flagged">${avg}/100 [AI Flag Override]</span>` 
    : `<span class="log-score">${avg}/100</span>`;
    
  li.innerHTML = `<span><strong>${name}</strong> (History 201)</span> ${integrityBadge}`;
  logList.prepend(li);
  
  setTimeout(() => {
    statusMsg.textContent = "";
  }, 400);
}

// Setup Explainer Dialog
function setupDialog() {
  openExplainerBtn.addEventListener('click', () => {
    explainerDialog.showModal();
  });

  closeExplainerBtn.addEventListener('click', () => {
    explainerDialog.close();
  });

  // Fallback for browsers without native dialog closedby light-dismiss
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    explainerDialog.addEventListener('click', (event) => {
      if (event.target !== explainerDialog) return;
      const rect = explainerDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        explainerDialog.close();
      }
    });
  }
}

// Setup Presenter Guide Drawer
function setupDrawer() {
  toggleGuideBtn.addEventListener('click', () => {
    presenterGuide.classList.toggle('open');
  });

  closeGuideBtn.addEventListener('click', () => {
    presenterGuide.classList.remove('open');
  });

  // Close guide when clicking outside of it
  document.addEventListener('click', (event) => {
    if (!presenterGuide.contains(event.target) && event.target !== toggleGuideBtn && !toggleGuideBtn.contains(event.target)) {
      presenterGuide.classList.remove('open');
    }
  });
}

// Run app init on load
window.addEventListener('DOMContentLoaded', init);
