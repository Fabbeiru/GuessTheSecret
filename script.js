document.addEventListener("DOMContentLoaded", () => {
  const setupModal = document.getElementById("setupModal");
  const startGameBtn = document.getElementById("startGameBtn");
  const addWordBtn = document.getElementById("addWordBtn");
  const wordInput = document.getElementById("wordInput");
  const hintInput = document.getElementById("hintInput");
  const wordHintList = document.getElementById("wordHintList");

  const hintDisplay = document.getElementById("hintDisplay");
  const wordDisplay = document.getElementById("wordDisplay");
  const usedLettersDiv = document.getElementById("usedLetters");
  const letterButtons = document.getElementById("letterButtons");
  const gameArea = document.getElementById("gameArea");
  const resetBtn = document.getElementById("resetBtn");

  let secretWord = "";
  let guessedLetters = [];
  let usedLetters = [];
  let gameOver = false;

  let wordHintPairs = [];
  let currentPairIndex = 0;

  addWordBtn.addEventListener("click", () => {
    const word = wordInput.value.trim();
    const hint = hintInput.value.trim();

    let valid = true;

    if (!word) {
      wordError.classList.remove("hidden");
      valid = false;
    } else {
      wordError.classList.add("hidden");
    }

    if (!hint) {
      hintError.classList.remove("hidden");
      valid = false;
    } else {
      hintError.classList.add("hidden");
    }

    if (!valid) return;

    wordHintPairs.push({ word, hint });

    const listItem = document.createElement("div");
    listItem.classList.add("flex", "items-center", "justify-between", "bg-gray-700", "p-2", "rounded");
    listItem.innerHTML = `
      <span>${word} - ${hint}</span>
      <button class="delete-btn text-red-500 hover:text-red-600">
        <i class="fa fa-trash-alt"></i>
      </button>
    `;
    const deleteButton = listItem.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => removeWordHint(wordHintPairs.length - 1));

    wordHintList.appendChild(listItem);

    wordInput.value = "";
    hintInput.value = "";
  });

  function removeWordHint(index) {
    wordHintPairs.splice(index, 1);
    wordHintList.innerHTML = "";
    wordHintPairs.forEach((pair, i) => {
      const listItem = document.createElement("div");
      listItem.classList.add("flex", "items-center", "justify-between", "bg-gray-700", "p-2", "rounded");
      listItem.innerHTML = `
      <span>${pair.word} - ${pair.hint}</span>
      <button class="delete-btn text-red-500 hover:text-red-600">
        <i class="fa fa-trash-alt"></i>
      </button>
    `;
      const deleteButton = listItem.querySelector("button");
      deleteButton.addEventListener("click", () => removeWordHint(i));
      wordHintList.appendChild(listItem);
    });
  }


  startGameBtn.addEventListener("click", () => {
    if (wordHintPairs.length === 0) {
      const word = wordInput.value.trim();
      const hint = hintInput.value.trim();

      if (!word || !hint) {
        wordError.classList.remove("hidden");
        hintError.classList.remove("hidden");
        return;
      }

      wordHintPairs.push({ word, hint });
    }

    setupModal.classList.add("hidden");
    gameArea.classList.remove("hidden");
    initializeGame();
  });

  resetBtn.addEventListener("click", () => {
    wordInput.value = "";
    hintInput.value = "";
    location.reload();
  });

  function initializeGame() {
    const currentPair = wordHintPairs[currentPairIndex] || { word: wordInput.value.trim(), hint: hintInput.value.trim() };

    if (!currentPair.word || !currentPair.hint) {
      return;
    }

    secretWord = currentPair.word.toLowerCase();
    guessedLetters = [...secretWord].map(c => c === " " ? " " : "_");
    usedLetters = [];
    gameOver = false;

    hintDisplay.innerHTML = "<strong>Pista:</strong> " + currentPair.hint;
    updateDisplay();
    createLetterButtons();

    fullGuessInput.disabled = false;
    submitGuessBtn.disabled = false;
    fullGuessInput.value = "";
    guessHistory.innerHTML = "";
  }

  function createLetterButtons() {
    letterButtons.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      const btn = document.createElement("button");
      btn.textContent = char;
      btn.id = `btn-${char}`;
      btn.className = "bg-gray-700 hover:bg-gray-600 py-3 text-lg rounded text-white";
      btn.addEventListener("click", () => handleGuess(char.toLowerCase()));
      letterButtons.appendChild(btn);
    }
  }

  function handleGuess(letter) {
    if (usedLetters.includes(letter) || gameOver) return;
    usedLetters.push(letter);
    const btn = document.getElementById(`btn-${letter.toUpperCase()}`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }

    if (secretWord.includes(letter)) {
      [...secretWord].forEach((char, i) => {
        if (char === letter) guessedLetters[i] = letter;
      });
    }

    updateDisplay();
    checkWin();
  }

  function updateDisplay() {
    wordDisplay.innerHTML = guessedLetters.map(char =>
      char === " " ? "&nbsp;&nbsp;" : char
    ).join(" ");
    usedLettersDiv.textContent = "Letras usadas: " + usedLetters.join(", ");
  }

  function checkWin() {
    if (!secretWord || secretWord.length === 0) return;

    if (guessedLetters.join("") === secretWord) {
      endGame(true);
    }
  }

  function endGame(success, showToast = true) {
    gameOver = true;

    if (success && showToast) {
      const toast = document.getElementById("toastMessage");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
      setTimeout(() => {
        currentPairIndex++;
        if (currentPairIndex < wordHintPairs.length) {
          setTimeout(() => {
            initializeGame();
          }, 2000);
        } else {
          toast.textContent = "¡Has completado todas las palabras!";
          toast.classList.remove("hidden");
          setTimeout(() => {
            location.reload();
          }, 3000);
        }
      }, 1000);
    }

    usedLetters.forEach(letter => {
      const btn = document.getElementById(`btn-${letter.toUpperCase()}`);
      if (btn) btn.disabled = true;
    });

    fullGuessInput.disabled = true;
    submitGuessBtn.disabled = true;
  }

  document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    const isTyping = document.activeElement === document.getElementById("fullGuessInput");
    if (isTyping) return;

    const letter = e.key.toLowerCase();
    if (/^[a-zñáéíóúü]$/i.test(letter)) {
      handleGuess(letter);
    }
  });

  const submitGuessBtn = document.getElementById("submitGuessBtn");
  const fullGuessInput = document.getElementById("fullGuessInput");
  const guessHistory = document.getElementById("guessHistory");

  submitGuessBtn.addEventListener("click", () => {
    if (gameOver) return;
    const userGuess = fullGuessInput.value.trim().toLowerCase();
    if (!userGuess) return;

    const li = document.createElement("li");
    li.textContent = userGuess;
    guessHistory.appendChild(li);

    if (userGuess === secretWord) {
      guessedLetters = [...secretWord];
      updateDisplay();
      endGame(true, true);
    } else {
      fullGuessInput.value = "";
    }
  });

  fullGuessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitGuessBtn.click();
    }
  });

  wordInput.focus();

});
