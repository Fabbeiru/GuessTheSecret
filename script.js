document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  const setupModal = document.getElementById("setupModal");
  const startGameBtn = document.getElementById("startGameBtn");
  const addWordBtn = document.getElementById("addWordBtn");
  const wordHintList = document.getElementById("wordHintList");
  const resetBtn = document.getElementById("resetBtn");
  const strictAccentsCheckbox = document.getElementById("strictAccentsCheckbox");

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
    strictAccents: false,
  };

  const wordHintPairs = [];
  const SPECIAL_LETTERS = ["Ñ", "Á", "É", "Í", "Ó", "Ú", "Ü"];

  function normalizeText(text) {
    return text.normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
  }

  function canonicalLetter(letter) {
    return gameState.strictAccents ? letter : normalizeText(letter);
  }

  function setModalOpen(isOpen) {
    if (isOpen) {
      header.setAttribute("inert", "");
      document.body.style.overflow = "hidden";
    } else {
      header.removeAttribute("inert");
      document.body.style.overflow = "";
    }
  }

  function initializeGame() {
    const currentPair = wordHintPairs[gameState.currentPairIndex] || { word: wordInput.value.trim(), hint: hintInput.value.trim() };

    if (!currentPair.word || !currentPair.hint) return;

    wordDisplay.classList.add("fade-out");

    setTimeout(() => {
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

      wordDisplay.classList.remove("fade-out");
    }, 250);
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

    const span = document.createElement("span");
    span.textContent = `${word} - ${hint}`;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn", "text-red-500", "hover:text-red-600");
    deleteButton.innerHTML = `<i class="fa fa-trash-alt"></i>`;
    deleteButton.addEventListener("click", () => removeWordHint(index));

    listItem.appendChild(span);
    listItem.appendChild(deleteButton);
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

    gameState.strictAccents = strictAccentsCheckbox.checked;

    setupModal.classList.add("hidden");
    gameArea.classList.remove("hidden");
    setModalOpen(false);
    initializeGame();

    requestAnimationFrame(() => requestAnimationFrame(() => gameArea.classList.add("visible")));
  });

  resetBtn.addEventListener("click", () => {
    wordInput.value = "";
    hintInput.value = "";
    location.reload();
  });

  function createLetterButtons() {
    letterButtons.innerHTML = "";

    for (let i = 65; i <= 90; i++) {
      addLetterButton(String.fromCharCode(i));
    }

    if (gameState.strictAccents) {
      SPECIAL_LETTERS.forEach(char => addLetterButton(char));
    }
  }

  function addLetterButton(char) {
    const btn = document.createElement("button");
    btn.textContent = char;
    btn.id = `btn-${char}`;
    btn.className = "bg-gray-700 hover:bg-gray-600 py-3 text-lg rounded text-white";
    btn.addEventListener("click", () => handleGuess(char.toLowerCase()));
    letterButtons.appendChild(btn);
  }

  function handleGuess(letter) {
    if (!gameState.secretWord) return;

    const canonical = canonicalLetter(letter);
    guessLetter(canonical);
    disableLetterButton(canonical);
    renderLetters();

    if (hasWon()) endGame(true);
  }

  function guessLetter(letter) {
    if (gameState.usedLetters.includes(letter) || gameState.gameOver) return false;

    gameState.usedLetters.push(letter);

    [...gameState.secretWord].forEach((char, i) => {
      if (canonicalLetter(char) === letter) gameState.guessedLetters[i] = char;
    });

    return true;
  }

  function guessWord(word) {
    if (gameState.gameOver) return false;

    if (canonicalLetter(word.toLowerCase()) === canonicalLetter(gameState.secretWord)) {
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

  setModalOpen(true);
  wordInput.focus();

});
