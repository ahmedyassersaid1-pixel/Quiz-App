/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */
const correctSound = new Audio("../voice/براڤو عليك_[cut_2sec].mp3");
const wrongSound = new Audio(
  "../voice/ارفدني ابوس ايدك انا فاشل_[cut_1sec].mp3",
);

export default class Question {
  // TODO: Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining

  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map((a) =>
      this.decodeHtml(a),
    );
    this.allAnswers = this.shuffleAnswers();
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 30;

    // Bound so we can add/remove the exact same function reference
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  // TODO: Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }

  // TODO: Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled array
  shuffleAnswers() {
    const answers = [...this.wrongAnswers, this.correctAnswer];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }

  // TODO: Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numOfQuestions) * 100);
  }

  // TODO: Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()

  displayQuestion() {
    const answersHtml = this.allAnswers
      .map(
        (answer, i) => `
          <button class="answer-btn" data-answer="${answer}">
            <span class="answer-key">${i + 1}</span>
            <span class="answer-text">${answer}</span>
          </button>
        `,
      )
      .join("");
    this.container.innerHTML = `
      <div class="game-card question-card mt-3 mx-auto">
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${this.getProgress()}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty}">
            <i class="fa-solid fa-face-smile"></i>
            <span>${this.quiz.difficulty}</span>
          </div>
          <div class="stat-badge timer">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid">
          ${answersHtml}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    this.startTimer();
  }
  // TODO: Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']
  addEventListeners() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.checkAnswer(btn));
    });

    document.addEventListener("keydown", this.handleKeyPress);
  }
  handleKeyPress(e) {
    const validKeys = ["1", "2", "3", "4"];
    if (!validKeys.includes(e.key)) return;

    const buttons = this.container.querySelectorAll(".answer-btn");
    const btn = buttons[Number(e.key) - 1];
    if (btn) this.checkAnswer(btn);
  }
  // TODO: Create removeEventListeners() method
  // Remove any keyboard listeners you added
  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  // TODO: Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 10 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
  startTimer() {
    const timerValueEl = this.container.querySelector(".timer-value");
    const timerBadge = this.container.querySelector(".stat-badge.timer");

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (timerValueEl) timerValueEl.textContent = this.timeRemaining;

      if (this.timeRemaining <= 10 && timerBadge) {
        timerBadge.classList.add("warning");
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // TODO: Create stopTimer() method
  // Use clearInterval(this.timerInterval)

  stopTimer() {
    clearInterval(this.timerInterval);
  }
  // TODO: Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay
  handleTimeUp() {
    if (this.answered) return;
    this.answered = true;
    this.removeEventListeners();

    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (
        btn.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()
      ) {
        btn.classList.add("correct");
      }
      btn.classList.add("disabled");
    });

    const card = this.container.querySelector(".question-card");
    if (card) {
      const timeUpMsg = document.createElement("div");
      timeUpMsg.className = "time-up-message";
      timeUpMsg.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
      card.appendChild(timeUpMsg);
    }

    this.animateQuestion(400);
  }

  // TODO: Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()

  checkAnswer(choiceElement) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();

    const selectedAnswer = choiceElement.dataset.answer;
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();

    if (isCorrect) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
      correctSound
        .play()
        .then(() => {
          console.log("Correct sound played");
        })
        .catch((error) => {
          console.error("Correct sound failed:", error);
        });
    } else {
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
      wrongSound
        .play()
        .then(() => {
          console.log("Wrong sound played");
        })
        .catch((error) => {
          console.error("Wrong sound failed:", error);
        });
    }

    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (btn !== choiceElement) {
        btn.classList.add("disabled");
      }
    });

    this.animateQuestion(400);
  }
  // TODO: Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class
  highlightCorrectAnswer() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (
        btn.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()
      ) {
        btn.classList.add("correct-reveal");
      }
    });
  }

  // TODO: Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button
  getNextQuestion() {
    const hasNext = this.quiz.nextQuestion();

    if (hasNext) {
      const nextQuestion = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );
      nextQuestion.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();
      const playAgainBtn = this.container.querySelector(".btn-restart");
      if (playAgainBtn) {
        playAgainBtn.addEventListener("click", () => {
          if (this.onQuizEnd) this.onQuizEnd();
        });
      }
    }
  }

  // TODO: Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
  animateQuestion(duration) {
    setTimeout(() => {
      const card = this.container.querySelector(".question-card");
      if (card) card.classList.add("exit");

      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}
