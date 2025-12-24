// script.js

// 単語リスト
var words = [
  'bonjour',
  'merci',
  'ordinateur',
  'clavier',
  'programmation',
  'école',
  'maison',
  'voiture',
  'livre',
  'fenêtre',
  'amitié',
  'équipe',
  'heureux',
  'sourire',
  'travail',
  'éléphant',
  'pomme',
  'château',
  'musique',
  'restaurant',
  'bibliothèque',
  'système',
  'internet',
  'information',
];

var TIME_LIMIT = 60;
var COUNTDOWN_START = 3;

var timer = TIME_LIMIT;
var countdownTimer = COUNTDOWN_START;
var intervalId = null;
var countdownIntervalId = null;

var currentWord = '';
var currentCharIndex = 0;

var stats = {
  errors: 0,
  correctChars: 0, // ★正解文字数（これが “characters typed” の仕様）
  isLocked: false,
};

// キーと指の対応
var keyToFingerMap = {
  A: 'left-pinky',
  Q: 'left-pinky',
  W: 'left-pinky',
  Z: 'left-ring',
  S: 'left-ring',
  X: 'left-ring',
  E: 'left-middle',
  D: 'left-middle',
  C: 'left-middle',
  R: 'left-index',
  F: 'left-index',
  V: 'left-index',
  T: 'left-index',
  G: 'left-index',
  B: 'left-index',
  Y: 'right-index',
  H: 'right-index',
  N: 'right-index',
  U: 'right-index',
  J: 'right-index',
  ',': 'right-index',
  I: 'right-middle',
  K: 'right-middle',
  ';': 'right-middle',
  O: 'right-ring',
  L: 'right-ring',
  '!': 'right-ring',
  P: 'right-pinky',
  M: 'right-pinky',
  '/': 'right-pinky',
};

// DOM
var wordDisplay = document.getElementById('word-display');
var countdownDisplay = document.getElementById('countdown');
var inputArea = document.getElementById('input-area');
var startButton = document.getElementById('start-button');
var timerDisplay = document.getElementById('timer');
var totalWordsDisplay = document.getElementById('total-words');
var errorsDisplay = document.getElementById('errors');
var statsDisplay = document.getElementById('stats');
var feedbackDisplay = document.getElementById('feedback');
var finalCharactersTyped = document.getElementById('characters-typed');
var finalErrors = document.getElementById('final-errors');
var restartButton = document.getElementById('restart-button');
var virtualKeyboard = document.getElementById('virtual-keyboard');
var fingerGuide = document.getElementById('finger-guide');

var keys = document.getElementsByClassName('key');

var fingers = {
  'left-pinky': document.getElementById('left-pinky'),
  'left-ring': document.getElementById('left-ring'),
  'left-middle': document.getElementById('left-middle'),
  'left-index': document.getElementById('left-index'),
  'right-index': document.getElementById('right-index'),
  'right-middle': document.getElementById('right-middle'),
  'right-ring': document.getElementById('right-ring'),
  'right-pinky': document.getElementById('right-pinky'),
};

// events
startButton.addEventListener('click', initiateCountdown);
inputArea.addEventListener('input', handleInput);
restartButton.addEventListener('click', resetGame);

// virtual keyboard click (optional)
for (var i = 0; i < keys.length; i++) {
  (function (keyEl) {
    keyEl.addEventListener('click', function () {
      if (inputArea.disabled || stats.isLocked) return;
      // クリックは “1文字だけ追加” する（今の設計と相性がいい）
      var ch = keyEl.getAttribute('data-key');
      inputArea.value = inputArea.value + ch;
      handleInput();
    });
  })(keys[i]);
}

function initiateCountdown() {
  startButton.disabled = true;

  countdownDisplay.classList.remove('hidden');
  wordDisplay.classList.add('hidden');
  inputArea.classList.add('hidden');
  statsDisplay.classList.add('hidden');
  virtualKeyboard.classList.add('hidden');
  fingerGuide.classList.remove('hidden');

  countdownTimer = COUNTDOWN_START;
  countdownDisplay.textContent = countdownTimer;

  if (countdownIntervalId) clearInterval(countdownIntervalId);

  countdownIntervalId = setInterval(function () {
    countdownTimer--;
    if (countdownTimer > 0) {
      countdownDisplay.textContent = countdownTimer;
    } else {
      clearInterval(countdownIntervalId);
      countdownDisplay.classList.add('hidden');

      wordDisplay.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      statsDisplay.classList.remove('hidden');
      virtualKeyboard.classList.remove('hidden');

      startGame();
    }
  }, 1000);
}

function startGame() {
  // reset runtime
  timer = TIME_LIMIT;
  stats.errors = 0;
  stats.correctChars = 0;
  stats.isLocked = false;
  currentCharIndex = 0;

  timerDisplay.textContent = timer;
  errorsDisplay.textContent = stats.errors;
  totalWordsDisplay.textContent = stats.correctChars;

  finalCharactersTyped.textContent = stats.correctChars;
  finalErrors.textContent = stats.errors;

  inputArea.value = '';
  inputArea.disabled = false;
  inputArea.classList.remove('correct', 'incorrect');
  inputArea.focus();

  feedbackDisplay.classList.add('hidden');
  statsDisplay.classList.remove('hidden');
  startButton.classList.add('hidden'); // ゲーム中は隠す（元の動きと同じ）

  // start timer
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateTimer, 1000);

  displayNewWord();
}

function updateTimer() {
  timer--;
  timerDisplay.textContent = timer;
  if (timer <= 0) endGame();
}

function displayNewWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  currentCharIndex = 0;
  stats.isLocked = false;

  wordDisplay.textContent = currentWord;
  inputArea.value = '';
  inputArea.classList.remove('correct', 'incorrect');

  // ★ハイライトは「次の1文字だけ」：毎回リセットしてから付ける
  clearHighlights();

  var firstChar = currentWord.charAt(currentCharIndex).toUpperCase();
  setActiveTargets(firstChar);
}

function handleInput() {
  var userInput = inputArea.value;

  // ロック中：消す（短くする）以外は禁止
  if (stats.isLocked) {
    if (userInput.length < currentCharIndex + 1) {
      // 1文字消したらロック解除、同じ文字を再挑戦
      stats.isLocked = false;
      inputArea.classList.remove('incorrect');
      inputArea.classList.add('correct');

      clearHighlights();
      var expected = currentWord.charAt(currentCharIndex).toUpperCase();
      setActiveTargets(expected);
    } else if (userInput.length > currentCharIndex + 1) {
      inputArea.value = userInput.substring(0, currentCharIndex + 1);
    }
    return;
  }

  // 1文字ずつ判定
  if (userInput.length === currentCharIndex + 1) {
    var expectedChar = currentWord.charAt(currentCharIndex).toUpperCase();
    var inputChar = userInput.charAt(currentCharIndex).toUpperCase();

    if (inputChar === expectedChar) {
      // 正解
      stats.correctChars++;
      totalWordsDisplay.textContent = stats.correctChars;
      finalCharactersTyped.textContent = stats.correctChars;

      inputArea.classList.add('correct');
      inputArea.classList.remove('incorrect');

      // 正解表示（ただし次の active に切り替える前に一瞬だけ）
      clearHighlights();
      markTargets(expectedChar, 'correct');

      currentCharIndex++;

      if (currentCharIndex === currentWord.length) {
        setTimeout(displayNewWord, 250);
      } else {
        var nextChar = currentWord.charAt(currentCharIndex).toUpperCase();

        // 次の1文字だけ active
        clearHighlights();
        setActiveTargets(nextChar);
      }
    } else {
      // 不正解：ロック
      stats.errors++;
      errorsDisplay.textContent = stats.errors;
      finalErrors.textContent = stats.errors;

      inputArea.classList.remove('correct');
      inputArea.classList.add('incorrect');

      clearHighlights();
      markTargets(expectedChar, 'incorrect');

      stats.isLocked = true;
    }
  } else if (userInput.length > currentCharIndex + 1) {
    // 余分に入力させない
    inputArea.value = userInput.substring(0, currentCharIndex + 1);
  } else {
    // まだ入力してない（空など）
    // active を保つために再設定（安全側）
    clearHighlights();
    var ch = currentWord.charAt(currentCharIndex).toUpperCase();
    setActiveTargets(ch);
  }
}

function endGame() {
  if (intervalId) clearInterval(intervalId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);

  inputArea.disabled = true;

  wordDisplay.classList.add('hidden');
  statsDisplay.classList.add('hidden');
  virtualKeyboard.classList.add('hidden');
  fingerGuide.classList.add('hidden');

  // 結果表示（正解文字数）
  finalCharactersTyped.textContent = stats.correctChars;
  finalErrors.textContent = stats.errors;

  feedbackDisplay.classList.remove('hidden');

  clearHighlights();
}

function resetGame() {
  feedbackDisplay.classList.add('hidden');

  startButton.classList.remove('hidden');
  startButton.disabled = false;

  wordDisplay.classList.remove('hidden');
  wordDisplay.textContent = 'Appuyer sur le bouton de Démarrer';

  inputArea.classList.remove('hidden');
  inputArea.value = '';
  inputArea.disabled = true;
  inputArea.classList.remove('correct', 'incorrect');

  statsDisplay.classList.add('hidden');
  virtualKeyboard.classList.add('hidden');
  fingerGuide.classList.add('hidden');

  // 表示を初期化
  timerDisplay.textContent = TIME_LIMIT;
  totalWordsDisplay.textContent = 0;
  errorsDisplay.textContent = 0;
  finalCharactersTyped.textContent = 0;
  finalErrors.textContent = 0;

  // 内部状態
  if (intervalId) clearInterval(intervalId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);

  stats.errors = 0;
  stats.correctChars = 0;
  stats.isLocked = false;
  currentWord = '';
  currentCharIndex = 0;

  clearHighlights();
}

/* ===== Highlight helpers ===== */

function clearHighlights() {
  // keys
  for (var i = 0; i < keys.length; i++) {
    keys[i].classList.remove('active', 'correct', 'incorrect');
  }
  // fingers
  for (var id in fingers) {
    if (fingers.hasOwnProperty(id) && fingers[id]) {
      fingers[id].classList.remove('active', 'correct', 'incorrect');
    }
  }
}

function setActiveTargets(keyChar) {
  highlightKey(keyChar, 'active');
  highlightFinger(keyChar, 'active');
}

function markTargets(keyChar, status) {
  highlightKey(keyChar, status);
  highlightFinger(keyChar, status);
}

function highlightKey(keyChar, status) {
  var target = String(keyChar).toUpperCase();
  for (var i = 0; i < keys.length; i++) {
    var keyEl = keys[i];
    if (keyEl.textContent.toUpperCase() === target) {
      keyEl.classList.remove('active', 'correct', 'incorrect');
      keyEl.classList.add(status);
      break;
    }
  }
}

function highlightFinger(keyChar, status) {
  var fingerId = keyToFingerMap[keyChar];
  if (!fingerId) return;

  var fingerEl = fingers[fingerId];
  if (!fingerEl) return;

  fingerEl.classList.remove('active', 'correct', 'incorrect');
  fingerEl.classList.add(status);
}
