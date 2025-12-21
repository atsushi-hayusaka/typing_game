// 単語リスト（フランス語の単語を追加）
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

var TIME_LIMIT = 60; // 秒
var COUNTDOWN_START = 3; // カウントダウン開始数字

var timer = TIME_LIMIT;
var countdownTimer = COUNTDOWN_START;
var intervalId;
var countdownIntervalId;
var currentWord = '';
var currentCharIndex = 0; // 現在の文字インデックス
var stats = {
  correctWords: 0,
  totalWords: 0,
  errors: 0,
  charactersTyped: 0, // 総文字数を追加
  isLocked: false, // 入力ロック状態
};

// キーと指の対応関係
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

// DOM要素の取得
var wordDisplay = document.getElementById('word-display');
var countdownDisplay = document.getElementById('countdown');
var inputArea = document.getElementById('input-area');
var startButton = document.getElementById('start-button');
var timerDisplay = document.getElementById('timer');
var totalWordsDisplay = document.getElementById('total-words');
var errorsDisplay = document.getElementById('errors');
var statsDisplay = document.getElementById('stats');
var feedbackDisplay = document.getElementById('feedback');
var finalCharactersTyped = document.getElementById('characters-typed'); // 新たに追加
var finalErrors = document.getElementById('final-errors');
var restartButton = document.getElementById('restart-button');
var virtualKeyboard = document.getElementById('virtual-keyboard'); // 新たに追加
var fingerGuide = document.getElementById('finger-guide'); // 新たに追加

// キーボードのキー要素を取得
var keys = document.getElementsByClassName('key');

// 指の要素を取得
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

// イベントリスナーの設定
startButton.addEventListener('click', initiateCountdown);
inputArea.addEventListener('input', handleInput);
restartButton.addEventListener('click', resetGame);

// キーボードキーのクリックイベントを追加（オプション）
for (var i = 0; i < keys.length; i++) {
  (function (key) {
    key.addEventListener('click', function () {
      if (!inputArea.disabled && !stats.isLocked) {
        inputArea.value += key.getAttribute('data-key');
        handleInput();
      }
    });
  })(keys[i]);
}

function initiateCountdown() {
  startButton.disabled = true;
  countdownDisplay.classList.remove('hidden');
  wordDisplay.classList.add('hidden');
  inputArea.classList.add('hidden');
  statsDisplay.classList.add('hidden');
  virtualKeyboard.classList.add('hidden'); // キーボードを非表示に
  fingerGuide.classList.remove('hidden'); // 指のガイドを表示

  countdownDisplay.textContent = COUNTDOWN_START;
  countdownTimer = COUNTDOWN_START;

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
      virtualKeyboard.classList.remove('hidden'); // キーボードを表示
      startGame();
    }
  }, 1000);
}

function startGame() {
  // リセット
  timer = TIME_LIMIT;
  stats = {
    correctWords: 0,
    totalWords: 0,
    errors: 0,
    charactersTyped: 0,
    isLocked: false,
  };
  currentCharIndex = 0;
  timerDisplay.textContent = timer;
  totalWordsDisplay.textContent = stats.totalWords;
  errorsDisplay.textContent = stats.errors;
  inputArea.value = '';
  inputArea.disabled = false;
  inputArea.classList.remove('correct', 'incorrect'); // クラスをリセット
  inputArea.focus();

  // タイマー開始
  intervalId = setInterval(updateTimer, 1000);

  // 最初の単語を表示
  displayNewWord();
}

function updateTimer() {
  timer--;
  timerDisplay.textContent = timer;
  if (timer <= 0) {
    endGame();
  }
}

function displayNewWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  wordDisplay.textContent = currentWord;
  inputArea.value = '';
  currentCharIndex = 0;
  inputArea.classList.remove('correct', 'incorrect');
  stats.isLocked = false; // 入力ロック解除
  var firstChar = currentWord.charAt(currentCharIndex).toUpperCase();
  highlightFinger(firstChar, 'active');
  highlightKey(firstChar, 'active');
}

function handleInput() {
  var userInput = inputArea.value;

  if (!stats.isLocked) {
    if (userInput.length === currentCharIndex + 1) {
      var expectedChar = currentWord.charAt(currentCharIndex).toUpperCase();
      var inputChar = userInput.charAt(currentCharIndex).toUpperCase();

      if (inputChar === expectedChar) {
        // 正解
        stats.correctWords++;
        stats.totalWords++;
        stats.charactersTyped++;
        totalWordsDisplay.textContent = stats.totalWords;
        errorsDisplay.textContent = stats.errors;
        finalCharactersTyped.textContent = stats.charactersTyped;

        // Apply correct class to input area
        inputArea.classList.add('correct');
        inputArea.classList.remove('incorrect');

        // Highlight key and finger as correct
        highlightKey(expectedChar, 'correct');
        highlightFinger(expectedChar, 'correct');

        currentCharIndex++;

        if (currentCharIndex === currentWord.length) {
          // 単語全体が正解
          // 次の単語を表示
          setTimeout(displayNewWord, 500);
        } else {
          // 次の文字をハイライト
          var nextChar = currentWord.charAt(currentCharIndex).toUpperCase();
          highlightKey(nextChar, 'active');
          highlightFinger(nextChar, 'active');
        }
      } else {
        // 不正解
        stats.errors++;
        stats.charactersTyped++;
        errorsDisplay.textContent = stats.errors;
        finalCharactersTyped.textContent = stats.charactersTyped;

        // Apply incorrect class to input area
        inputArea.classList.remove('correct');
        inputArea.classList.add('incorrect');

        // Highlight key and finger as incorrect
        highlightKey(expectedChar, 'incorrect');
        highlightFinger(expectedChar, 'incorrect');

        // Lock the input
        stats.isLocked = true;
      }
    } else if (userInput.length > currentCharIndex + 1) {
      // Prevent typing more than expected
      inputArea.value = userInput.substring(0, currentCharIndex + 1);
    }
  } else {
    // Input is locked, check if user deleted the mistyped character
    if (userInput.length < currentCharIndex + 1) {
      // User has deleted the mistyped character
      stats.isLocked = false;
      inputArea.classList.remove('incorrect');
      inputArea.classList.add('correct'); // Revert to correct

      // Re-highlight the current character's key and finger as correct
      var expectedChar = currentWord.charAt(currentCharIndex).toUpperCase();
      highlightKey(expectedChar, 'correct');
      highlightFinger(expectedChar, 'correct');

      // Highlight the current character's key and finger as active again
      highlightKey(expectedChar, 'active');
      highlightFinger(expectedChar, 'active');
    } else {
      // User tried to add more characters without correcting
      // Remove the extra character
      inputArea.value = userInput.substring(0, currentCharIndex + 1);
    }
  }

  // 総文字数をカウント
  stats.charactersTyped = userInput.length;
  // フィードバックセクションに表示する文字数を更新
  finalCharactersTyped.textContent = stats.charactersTyped;
}

function endGame() {
  clearInterval(intervalId);
  clearInterval(countdownIntervalId);
  inputArea.disabled = true;
  wordDisplay.classList.add('hidden'); // word-displayを非表示にする
  statsDisplay.classList.add('hidden'); // statsを非表示にする
  virtualKeyboard.classList.add('hidden'); // キーボードを非表示に
  fingerGuide.classList.add('hidden'); // 指のガイドを非表示に
  startButton.classList.add('hidden'); // Démarrerボタンを非表示にする

  // フィードバック表示
  finalCharactersTyped.textContent = stats.charactersTyped;
  finalErrors.textContent = stats.errors;

  feedbackDisplay.classList.remove('hidden');
}

function resetGame() {
  feedbackDisplay.classList.add('hidden');
  startButton.classList.remove('hidden');
  startButton.disabled = false;
  wordDisplay.classList.remove('hidden');
  wordDisplay.textContent = 'Appuyer sur le bouton de Démarrer';
  inputArea.classList.remove('hidden');
  statsDisplay.classList.add('hidden');
  virtualKeyboard.classList.add('hidden'); // キーボードを非表示に
  fingerGuide.classList.add('hidden'); // 指のガイドを非表示に
  inputArea.value = ''; // 入力フォームをクリア
  inputArea.classList.remove('correct', 'incorrect'); // クラスをリセット
  stats.isLocked = false; // 入力ロック解除

  // キーボードのハイライトをリセット
  for (var i = 0; i < keys.length; i++) {
    keys[i].classList.remove('active', 'correct', 'incorrect');
  }

  // 指のハイライトをリセット
  for (var finger in fingers) {
    if (fingers.hasOwnProperty(finger)) {
      fingers[finger].classList.remove('active', 'correct', 'incorrect');
    }
  }
}

function highlightKey(keyChar, status) {
  for (var i = 0; i < keys.length; i++) {
    var keyElement = keys[i];
    if (keyElement.textContent.toUpperCase() === keyChar) {
      if (status === 'correct') {
        keyElement.classList.remove('incorrect', 'active');
        keyElement.classList.add('correct');
      } else if (status === 'incorrect') {
        keyElement.classList.remove('correct', 'active');
        keyElement.classList.add('incorrect');
      } else if (status === 'active') {
        keyElement.classList.remove('correct', 'incorrect');
        keyElement.classList.add('active');
      }
      break; // 対応するキーが見つかったらループを抜ける
    }
  }
}

function highlightFinger(keyChar, status) {
  var fingerId = keyToFingerMap[keyChar];
  if (!fingerId) {
    return;
  }

  var fingerElement = fingers[fingerId];
  if (!fingerElement) {
    return;
  }

  // クラスを適用する前に、既に設定されている状態に応じてクラスを削除
  if (status === 'correct') {
    fingerElement.classList.remove('incorrect', 'active');
    fingerElement.classList.add('correct');
  } else if (status === 'incorrect') {
    fingerElement.classList.remove('correct', 'active');
    fingerElement.classList.add('incorrect');
  } else if (status === 'active') {
    fingerElement.classList.remove('correct', 'incorrect');
    fingerElement.classList.add('active');
  }
}
