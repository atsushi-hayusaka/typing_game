// 単語リスト（フランス語の単語を追加）
const words = [
    "bonjour", "merci", "ordinateur", "clavier", "programmation",
    "école", "maison", "voiture", "livre", "fenêtre",
    "amitié", "équipe", "heureux", "sourire", "travail",
    "éléphant", "pomme", "château", "musique",
    "restaurant", "bibliothèque", "système", "internet", "information"
];

const TIME_LIMIT = 60; // 秒
const COUNTDOWN_START = 3; // カウントダウン開始数字

let timer = TIME_LIMIT;
let countdownTimer = COUNTDOWN_START;
let intervalId;
let countdownIntervalId;
let currentWord = "";
let currentCharIndex = 0; // 現在の文字インデックス
let stats = {
    correctWords: 0,
    totalWords: 0,
    errors: 0,
    charactersTyped: 0 // 総文字数を追加
};

// DOM要素の取得
const wordDisplay = document.getElementById('word-display');
const countdownDisplay = document.getElementById('countdown');
const inputArea = document.getElementById('input-area');
const startButton = document.getElementById('start-button');
// const wpmDisplay = document.getElementById('wpm'); // 削除
const timerDisplay = document.getElementById('timer');
// const correctWordsDisplay = document.getElementById('correct-words'); // 削除
const totalWordsDisplay = document.getElementById('total-words');
const errorsDisplay = document.getElementById('errors');
const statsDisplay = document.getElementById('stats');
const feedbackDisplay = document.getElementById('feedback');
const finalCharactersTyped = document.getElementById('characters-typed'); // 新たに追加
const finalErrors = document.getElementById('final-errors');
// const finalWpm = document.getElementById('final-wpm'); // 削除
const restartButton = document.getElementById('restart-button');
const virtualKeyboard = document.getElementById('virtual-keyboard'); // 新たに追加

startButton.addEventListener('click', initiateCountdown);
inputArea.addEventListener('input', handleInput);
restartButton.addEventListener('click', resetGame);

// キーボードのキー要素を取得
const keys = document.querySelectorAll('.key');

function initiateCountdown() {
    startButton.disabled = true;
    countdownDisplay.classList.remove('hidden');
    wordDisplay.classList.add('hidden');
    inputArea.classList.add('hidden');
    statsDisplay.classList.add('hidden');
    virtualKeyboard.classList.add('hidden'); // キーボードを非表示に

    countdownDisplay.textContent = COUNTDOWN_START;
    countdownTimer = COUNTDOWN_START;

    countdownIntervalId = setInterval(() => {
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
    stats = {correctWords: 0, totalWords: 0, errors: 0, charactersTyped: 0};
    currentCharIndex = 0;
    timerDisplay.textContent = timer;
    // correctWordsDisplay.textContent = stats.correctWords; // 「Nombre de mots exacts」を削除したため削除
    totalWordsDisplay.textContent = stats.totalWords;
    errorsDisplay.textContent = stats.errors;
    // wpmDisplay.textContent = stats.wpm; // 削除
    inputArea.value = "";
    inputArea.disabled = false;
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
    inputArea.value = "";
    currentCharIndex = 0;
    inputArea.classList.remove('correct', 'incorrect');
    highlightKey(currentWord.charAt(currentCharIndex).toUpperCase());
}

function handleInput() {
    const userInput = inputArea.value.trim();
    // 総文字数をカウント
    stats.charactersTyped = inputArea.value.length;
    // フィードバックセクションに表示する文字数を更新
    finalCharactersTyped.textContent = stats.charactersTyped;

    if (userInput.length > 0) {
        const expectedChar = currentWord.charAt(currentCharIndex).toUpperCase();
        const inputChar = userInput.charAt(currentCharIndex).toUpperCase();

        if (inputChar === expectedChar) {
            // 正解
            inputArea.classList.add('correct');
            inputArea.classList.remove('incorrect');
            // キーボードのハイライト更新
            highlightKey(expectedChar, true);
            currentCharIndex++;

            if (currentCharIndex === currentWord.length) {
                // 単語全体が正解
                stats.correctWords++;
                stats.totalWords++;
                totalWordsDisplay.textContent = stats.totalWords;
                // 次の単語を表示
                setTimeout(displayNewWord, 500);
            } else {
                // 次の文字をハイライト
                highlightKey(currentWord.charAt(currentCharIndex).toUpperCase());
            }
        } else {
            // 不正解
            if (!inputArea.classList.contains('incorrect')) {
                stats.errors++;
                errorsDisplay.textContent = stats.errors;
                inputArea.classList.add('incorrect');
                inputArea.classList.remove('correct');
                // キーボードのハイライトを不正解に
                highlightKey(expectedChar, false, true);
            }
        }
    }
}

function endGame() {
    clearInterval(intervalId);
    clearInterval(countdownIntervalId);
    inputArea.disabled = true;
    wordDisplay.classList.add('hidden'); // word-displayを非表示にする
    statsDisplay.classList.add('hidden'); // statsを非表示にする
    virtualKeyboard.classList.add('hidden'); // キーボードを非表示に
    startButton.classList.add('hidden'); // Démarrerボタンを非表示にする

    // フィードバック表示
    finalCharactersTyped.textContent = stats.charactersTyped;
    finalErrors.textContent = stats.errors;
    // finalWpm.textContent = Math.floor(stats.wpm); // 「Vitesse de frappe」を削除したため削除

    feedbackDisplay.classList.remove('hidden');
}

function resetGame() {
    feedbackDisplay.classList.add('hidden');
    startButton.classList.remove('hidden');
    startButton.disabled = false;
    wordDisplay.classList.remove('hidden');
    wordDisplay.textContent = "Appuyer sur le bouton de Démarrer";
    inputArea.classList.remove('hidden');
    statsDisplay.classList.add('hidden');
    virtualKeyboard.classList.add('hidden'); // キーボードを非表示に
    inputArea.value = ""; // 入力フォームをクリア
    inputArea.classList.remove('correct', 'incorrect'); // クラスをリセット

    // キーボードのハイライトをリセット
    keys.forEach(key => {
        key.classList.remove('active', 'correct', 'incorrect');
    });
}

function highlightKey(keyChar, correct = false, incorrect = false) {
    // すべてのキーのハイライトを解除
    keys.forEach(key => {
        if (!correct && !incorrect) {
            key.classList.remove('active');
        }
        key.classList.remove('correct', 'incorrect');
    });

    // 該当キーをハイライト
    keys.forEach(key => {
        if (key.textContent.toUpperCase() === keyChar) {
            if (correct) {
                key.classList.add('correct');
            } else if (incorrect) {
                key.classList.add('incorrect');
            } else {
                key.classList.add('active');
            }
        }
    });
}

