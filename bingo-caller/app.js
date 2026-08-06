// Game State
let calledNumbers = [];
let remainingNumbers = Array.from({ length: 99 }, (_, i) => i + 1);
let isPlaying = false;
let autoDrawIntervalId = null;

// Settings
let currentFontSize = 10; // in rem
let drawInterval = 4000; // in ms
let isMuted = false;
let voices = [];
let selectedVoice = null;
let voiceRate = 1.0;

// DOM Elements
const mainNumberEl = document.getElementById('main-number');
const statusTextEl = document.getElementById('status-text');
const btnDraw = document.getElementById('btn-draw');
const btnAuto = document.getElementById('btn-auto');
const autoBtnLabel = document.getElementById('auto-btn-label');
const playIcon = btnAuto.querySelector('.play-icon');
const pauseIcon = btnAuto.querySelector('.pause-icon');
const btnResetTrigger = document.getElementById('btn-reset-trigger');
const statsCalledEl = document.getElementById('stats-called');
const statsRemainingEl = document.getElementById('stats-remaining');
const boardGridEl = document.getElementById('board-grid');
const historyListEl = document.getElementById('history-list');
const rippleEl = document.getElementById('ripple');

// Controls Elements
const sliderFont = document.getElementById('slider-font');
const fontSizeVal = document.getElementById('font-size-val');
const sliderInterval = document.getElementById('slider-interval');
const intervalVal = document.getElementById('interval-val');
const btnMute = document.getElementById('btn-mute');
const speakerIcon = btnMute.querySelector('.speaker-icon');
const speakerMutedIcon = btnMute.querySelector('.speaker-muted-icon');
const selectVoice = document.getElementById('select-voice');
const sliderRate = document.getElementById('slider-rate');
const rateVal = document.getElementById('rate-val');

// Modal Elements
const confirmDialog = document.getElementById('dialog-confirm');
const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
const btnConfirmReset = document.getElementById('btn-confirm-reset');

// Initialize the 1-99 board
function initBoard() {
  boardGridEl.innerHTML = '';
  for (let i = 1; i <= 99; i++) {
    const chip = document.createElement('div');
    chip.className = 'num-chip';
    chip.id = `chip-${i}`;
    chip.textContent = i;
    chip.setAttribute('role', 'gridcell');
    boardGridEl.appendChild(chip);
  }
}

// Draw a random number
function drawNumber() {
  if (remainingNumbers.length === 0) {
    stopAutoDraw();
    statusTextEl.textContent = "Game Complete!";
    statusTextEl.className = "status-indicator finished";
    alert("All numbers have been drawn!");
    return;
  }

  // Choose a random index
  const index = Math.floor(Math.random() * remainingNumbers.length);
  const number = remainingNumbers.splice(index, 1)[0];
  calledNumbers.push(number);

  // Update UI State
  updateNumberDisplay(number);
  markNumberOnBoard(number);
  updateStats();
  updateHistory(number);

  // Speak the number out loud
  speak(number);

  if (remainingNumbers.length === 0) {
    stopAutoDraw();
    statusTextEl.textContent = "Game Finished";
    statusTextEl.className = "status-indicator finished";
  }
}

// Update the giant display number
function updateNumberDisplay(num) {
  mainNumberEl.textContent = num;
  mainNumberEl.classList.remove('pulse');
  rippleEl.classList.remove('animate');

  // Trigger browser reflow to restart animations
  void mainNumberEl.offsetWidth;

  mainNumberEl.classList.add('pulse');
  rippleEl.classList.add('animate');
}

// Mark called number on board
function markNumberOnBoard(num) {
  // Clear any existing "just-called" tags from other chips
  const previouslyJustCalled = document.querySelector('.num-chip.just-called');
  if (previouslyJustCalled) {
    previouslyJustCalled.classList.remove('just-called');
  }

  const chip = document.getElementById(`chip-${num}`);
  if (chip) {
    chip.classList.add('called', 'just-called');
  }
}

// Update remaining and called counters
function updateStats() {
  statsCalledEl.textContent = calledNumbers.length;
  statsRemainingEl.textContent = remainingNumbers.length;
}

// Update history list
function updateHistory(num) {
  // Remove empty label if present
  const emptyLabel = historyListEl.querySelector('.empty-history');
  if (emptyLabel) {
    emptyLabel.remove();
  }

  // Create a new chip for the history
  const chip = document.createElement('span');
  chip.className = 'history-chip';
  chip.textContent = num;

  // Prepend to top
  historyListEl.insertBefore(chip, historyListEl.firstChild);

  // Keep only the last 5 draws
  const historyChips = historyListEl.querySelectorAll('.history-chip');
  if (historyChips.length > 5) {
    historyChips[historyChips.length - 1].remove();
  }
}

// Start Auto Play Mode
function startAutoDraw() {
  isPlaying = true;
  autoBtnLabel.textContent = "Pause";
  btnAuto.classList.add('active-state');
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  btnDraw.disabled = true;
  btnDraw.style.opacity = '0.5';
  btnDraw.style.pointerEvents = 'none';
  statusTextEl.textContent = "Auto Calling";
  statusTextEl.className = "status-indicator calling";

  // Immediate draw if game just started
  if (calledNumbers.length === 0) {
    drawNumber();
  }

  autoDrawIntervalId = setInterval(drawNumber, drawInterval);
}

// Stop Auto Play Mode
function stopAutoDraw() {
  isPlaying = false;
  autoBtnLabel.textContent = "Auto Draw";
  btnAuto.classList.remove('active-state');
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  btnDraw.disabled = false;
  btnDraw.style.opacity = '1';
  btnDraw.style.pointerEvents = 'auto';
  
  if (remainingNumbers.length > 0) {
    statusTextEl.textContent = "Paused";
    statusTextEl.className = "status-indicator";
  }

  if (autoDrawIntervalId) {
    clearInterval(autoDrawIntervalId);
    autoDrawIntervalId = null;
  }
}

// Reset Game
function resetGame() {
  stopAutoDraw();
  calledNumbers = [];
  remainingNumbers = Array.from({ length: 99 }, (_, i) => i + 1);

  mainNumberEl.textContent = '--';
  mainNumberEl.classList.remove('pulse');
  rippleEl.classList.remove('animate');
  
  statusTextEl.textContent = "Ready to Play";
  statusTextEl.className = "status-indicator";

  updateStats();
  
  // Reset grid chips
  const chips = boardGridEl.querySelectorAll('.num-chip');
  chips.forEach(chip => {
    chip.className = 'num-chip';
  });

  // Reset history
  historyListEl.innerHTML = '<span class="empty-history">No numbers drawn yet</span>';
}

// --- Text to Speech (Web Speech API) ---
function loadVoices() {
  if (typeof speechSynthesis === 'undefined') return;
  
  voices = speechSynthesis.getVoices();
  
  // Filter voices to english/natural ones as preference
  selectVoice.innerHTML = '';
  
  // Add a default option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'System Default Voice';
  defaultOpt.selected = true;
  selectVoice.appendChild(defaultOpt);

  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    selectVoice.appendChild(option);
  });
}

function speak(num) {
  if (isMuted || typeof speechSynthesis === 'undefined') return;

  // Cancel any active speech to avoid queues build up
  speechSynthesis.cancel();

  // Tombola/Bingo calling styles: e.g. "Number 45, four, five"
  let text = `Number ${num}.`;
  if (num < 10) {
    text += ` ${num}.`;
  } else {
    const digits = num.toString().split('');
    text += ` ${digits[0]}, ${digits[1]}.`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (selectVoice.value !== '') {
    const voiceIdx = parseInt(selectVoice.value, 10);
    utterance.voice = voices[voiceIdx];
  } else {
    utterance.lang = 'en-US'; // Force system to use a default English voice
  }
  
  utterance.rate = voiceRate;
  speechSynthesis.speak(utterance);
}

// --- Event Listeners ---

// Draw Button click
btnDraw.addEventListener('click', () => {
  drawNumber();
});

// Auto Button click
btnAuto.addEventListener('click', () => {
  if (isPlaying) {
    stopAutoDraw();
  } else {
    startAutoDraw();
  }
});

// Font size change
sliderFont.addEventListener('input', (e) => {
  currentFontSize = e.target.value;
  fontSizeVal.textContent = `${currentFontSize}rem`;
  document.documentElement.style.setProperty('--display-font-size', `${currentFontSize}rem`);
});

// Interval change
sliderInterval.addEventListener('input', (e) => {
  const seconds = parseFloat(e.target.value);
  intervalVal.textContent = `${seconds.toFixed(1)}s`;
  drawInterval = seconds * 1000;

  // If currently running, restart interval with new speed
  if (isPlaying) {
    clearInterval(autoDrawIntervalId);
    autoDrawIntervalId = setInterval(drawNumber, drawInterval);
  }
});

// Mute toggle
btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    speakerIcon.classList.add('hidden');
    speakerMutedIcon.classList.remove('hidden');
    btnMute.title = "Unmute voice calls";
  } else {
    speakerIcon.classList.remove('hidden');
    speakerMutedIcon.classList.add('hidden');
    btnMute.title = "Mute voice calls";
  }
});

// Speech rate control
sliderRate.addEventListener('input', (e) => {
  voiceRate = parseFloat(e.target.value);
  rateVal.textContent = `${voiceRate.toFixed(1)}x`;
});

// Reset Modals
btnResetTrigger.addEventListener('click', () => {
  if (isPlaying) {
    stopAutoDraw();
  }
  confirmDialog.showModal();
});

btnConfirmCancel.addEventListener('click', () => {
  confirmDialog.close();
});

// Reset Dialog action
btnConfirmReset.addEventListener('click', () => {
  resetGame();
  confirmDialog.close();
});

// Prevent escape key from closing dialog without pausing if we want (it closes natively, closedby="any" handles it)
confirmDialog.addEventListener('close', () => {
  // Can restart auto draw or handle focus if needed
});

// Setup voices on load & dynamically if changed
if (typeof speechSynthesis !== 'undefined') {
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

// Keyboard shortcuts for power users!
document.addEventListener('keydown', (e) => {
  // If the focus is on a slider or selection, don't trigger spacebar behavior to avoid accessibility clash
  const activeTag = document.activeElement.tagName;
  if (activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'BUTTON') {
    return;
  }
  
  if (e.code === 'Space') {
    e.preventDefault(); // stop page scrolling
    if (isPlaying) {
      stopAutoDraw();
    } else {
      drawNumber();
    }
  }
  if (e.code === 'KeyR' && e.shiftKey) {
    btnResetTrigger.click();
  }
});

// Initialize on page load
initBoard();
updateStats();
