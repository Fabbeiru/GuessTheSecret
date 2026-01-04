document.addEventListener("DOMContentLoaded", () => {
  const setupModal = document.getElementById("setupModal");
  const startGameBtn = document.getElementById("startGameBtn");
  const addWordBtn = document.getElementById("addWordBtn");
  const wordHintList = document.getElementById("wordHintList");
  const resetBtn = document.getElementById("resetBtn");

  const wordInput = document.getElementById("wordInput");
  const hintInput = document.getElementById("hintInput");
  const wordError = document.getElementById("wordError");
  const hintError = document.getElementById("hintError");
  
  const gameArea = document.getElementById("gameArea");
  const hintDisplay = document.getElementById("hintDisplay");
  const wordDisplay = document.getElementById("wordDisplay");
  const usedLettersDiv = document.getElementById("usedLetters");
  const letterButtons = document.getElementById("letterButtons");
  const guessHistory = document.getElementById("guessHistory");

  const submitGuessBtn = document.getElementById("submitGuessBtn");
  const fullGuessInput = document.getElementById("fullGuessInput");

  const gameState = {
    secretWord: "",
    guessedLetters: [],
    usedLetters: [],
    gameOver: false,
    currentPairIndex: 0,
  };

  const wordHintPairs = [];

  function initializeGame() {
    const currentPair = wordHintPairs[gameState.currentPairIndex] || { word: wordInput.value.trim(), hint: hintInput.value.trim() };

    if (!currentPair.word || !currentPair.hint) return;

    gameState.secretWord = currentPair.word.toLowerCase();
    gameState.guessedLetters = [...gameState.secretWord].map(c => c === " " ? " " : "_");
    gameState.usedLetters = [];
    gameState.gameOver = false;

    hintDisplay.innerHTML = "<strong>Pista:</strong> " + currentPair.hint;
    renderLetters();
    createLetterButtons();

    fullGuessInput.disabled = false;
    submitGuessBtn.disabled = false;
    fullGuessInput.value = "";
    guessHistory.innerHTML = "";
  }

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
    appendWordHintToList(word, hint, wordHintPairs.length - 1);

    wordInput.value = "";
    hintInput.value = "";
  });

  function appendWordHintToList(word, hint, index) {
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
  }

  function removeWordHint(index) {
    wordHintPairs.splice(index, 1);
    wordHintList.innerHTML = "";
    wordHintPairs.forEach((pair, i) => appendWordHintToList(pair.word, pair.hint, i));
  }

  startGameBtn.addEventListener("click", () => {
    if (wordHintPairs.length === 0) {
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
    if (!gameState.secretWord) return;

    guessLetter(letter);
    disableLetterButton(letter);
    renderLetters();

    if (hasWon()) endGame(true);
  }

  function guessLetter(letter) {
    if (gameState.usedLetters.includes(letter) || gameState.gameOver) return false;

    gameState.usedLetters.push(letter);

    [...gameState.secretWord].forEach((char, i) => {
      if (char === letter) gameState.guessedLetters[i] = letter;
    });

    return true;
  }

  function guessWord(word) {
    if (gameState.gameOver) return false;

    if (word.toLowerCase() === gameState.secretWord) {
      gameState.guessedLetters = [...gameState.secretWord];
      return true;
    }

    return false;
  }

  function hasWon() {
    if (!gameState.secretWord) return false;

    return gameState.guessedLetters.join("") === gameState.secretWord;
  }

  function renderLetters() {
    wordDisplay.innerHTML = gameState.guessedLetters.map(c => c === " " ? "&nbsp;&nbsp;" : c).join(" ");
    usedLettersDiv.textContent = "Letras usadas: " + gameState.usedLetters.join(", ");
  }

  function disableLetterButton(letter) {
    const btn = document.getElementById(`btn-${letter.toUpperCase()}`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }

  function endGame(success, showToast = true) {
    gameState.gameOver = true;
    
    const toast = document.getElementById("toastMessage");

    if (success && showToast) {
      toast.textContent = "🎉 ¡Has adivinado la palabra! 🎉";
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");

        gameState.currentPairIndex++;

        if (gameState.currentPairIndex < wordHintPairs.length) {
          toast.textContent = "Cargando siguiente palabra...";
          toast.classList.add("show");

          setTimeout(() => {
            toast.classList.remove("show");
            initializeGame();
          }, 1500);

        } else {
          toast.textContent = "🎉 🎉 ¡Has completado todas las palabras! 🎉 🎉";
          toast.classList.add("show");
          setTimeout(() => location.reload(), 3000);
        }
      }, 3000);
    }

    gameState.usedLetters.forEach((letter) => disableLetterButton(letter));
    fullGuessInput.disabled = true;
    submitGuessBtn.disabled = true;
  }

  document.addEventListener("keydown", (e) => {
    if (gameState.gameOver) return;
    if (document.activeElement === fullGuessInput) return;

    const letter = e.key.toLowerCase();
    if (/^[a-zñáéíóúü]$/i.test(letter)) handleGuess(letter);
  });

  submitGuessBtn.addEventListener("click", () => {
    if (gameState.gameOver) return;
    const userGuess = fullGuessInput.value.trim();
    if (!userGuess) return;

    const li = document.createElement("li");
    li.textContent = userGuess;
    guessHistory.appendChild(li);

    const correct = guessWord(userGuess);
    renderLetters();

    if (correct) {
      endGame(true, true);
    } else {
      fullGuessInput.value = "";
    }
  });

  fullGuessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuessBtn.click();
  });

  wordInput.focus();

});
