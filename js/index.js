/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 * 
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states


 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 * 
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */
import Quiz from "./quiz.js";
import Question from "./question.js";
const quizOptionsForm = document.querySelector("#quizOptions");
const startQuizeBtn = document.querySelector("#startQuiz");
const playerName = document.querySelector("#playerName");
const selectCategorys = document.querySelectorAll(
  "#categorySelect .custom-select-options .custom-select-option",
);
const selectDiffuclt = document.querySelectorAll(
  "#difficultySelect .custom-select-options .custom-select-option",
);
const questionNum = document.querySelector("#questionsNumber");
const errorMessage = document.querySelector(".error-message");
const questionsContainer = document.querySelector(".questions-container");

let category = "";
let difficult = "easy";
let numOfQuestions = 10;
let currentQuiz = null;

for (let index = 0; index < selectCategorys.length; index++) {
  selectCategorys[index].addEventListener("click", function (e) {
    category = e.currentTarget.dataset.value;
  });
}
for (let index = 0; index < selectDiffuclt.length; index++) {
  selectDiffuclt[index].addEventListener("click", function (e) {
    difficult = e.currentTarget.dataset.value;
  });
}
questionNum.addEventListener("change", function (e) {
  if (Number(e.target.value) < 1) {
    console.log("should be bigger");
    errorMessage.classList.remove("hidden");
    errorMessage.children[1].innerHTML = `Minimum 1 question required.`;
  } else if (Number(e.target.value) > 50) {
    console.log("should be smalest");
    errorMessage.classList.remove("hidden");
    errorMessage.children[1].innerHTML = `Maximum 50 questions allowed.`;
  } else {
    console.log("correct");
    errorMessage.classList.add("hidden");
    numOfQuestions = Number(e.target.value);
  }
});

// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()

// ============================================
// TODO: Create variable to store current quiz
// ============================================
// let currentQuiz = null;

// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure
function showLoading() {
  questionsContainer.innerHTML = `
    <div class="loading vh-100 d-flex justify-content-center align-items-center">
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading Questions...</p>
      </div>
    </div>
  `;
}
// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay
function hideLoading() {
  const loadingEl = questionsContainer.querySelector(".loading");
  if (loadingEl) loadingEl.remove();
}
// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()
function showError(message) {
  questionsContainer.innerHTML = `
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">${message}</p>
      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>
  `;

  const retryBtn = questionsContainer.querySelector(".retry-btn");
  retryBtn.addEventListener("click", resetToStart());
}
// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)
function validateForm() {
  if (!questionNum.value) {
    return { isValid: false, error: "Please enter the number of questions." };
  }

  const value = Number(questionNum.value);

  if (value < 1) {
    return { isValid: false, error: "Minimum 1 question required." };
  }

  if (value > 50) {
    return { isValid: false, error: "Maximum 50 questions allowed." };
  }

  return { isValid: true, error: null };
}

// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect
function showFormError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

  startQuizeBtn.parentElement.insertBefore(errorDiv, startQuizeBtn);

  setTimeout(() => {
    errorDiv.style.transition = "opacity 0.5s";
    errorDiv.style.opacity = "0";
    setTimeout(() => errorDiv.remove(), 500);
  }, 3000);
}
// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null
function resetToStart() {
  questionsContainer.innerHTML = "";

  playerName.value = "";
  questionNum.value = 10;
  numOfQuestions = 10;
  category = "";
  difficult = "easy";

  quizOptionsForm.classList.remove("hidden");
  currentQuiz = null;
}
// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message

async function startQuiz() {
  const validation = validateForm();

  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  const name = playerName.value.trim() || "Player";
  const total = Number(questionNum.value);

  currentQuiz = new Quiz(name, category, difficult, total);

  quizOptionsForm.classList.add("hidden");
  showLoading();

  try {
    await currentQuiz.getQuestions();
    hideLoading();

    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      showError("No questions available. Please try different settings.");
      return;
    }

    const question = new Question(
      currentQuiz,
      questionsContainer,
      resetToStart,
    );
    question.displayQuestion();
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}
// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()
startQuizeBtn.addEventListener("click", startQuiz);

questionNum.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    startQuiz();
  }
});
