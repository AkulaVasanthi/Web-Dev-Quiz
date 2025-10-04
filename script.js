// Quiz Data (10 Questions - from previous response)
const quizData = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"],
        answer: "Hyper Text Markup Language"
    },
    {
        question: "Which CSS property is used to change the text color of an element?",
        options: ["fgcolor", "color", "text-color", "font-color"],
        answer: "color"
    },
    {
        question: "Inside which HTML element do we put the JavaScript?",
        options: ["<js>", "<scripting>", "<script>", "<javascript>"],
        answer: "<script>"
    },
    {
        question: "What is the correct way to write an array in JavaScript?",
        options: ["var colors = [\"red\", \"green\", \"blue\"]", "var colors = \"red\", \"green\", \"blue\"", "var colors = (1:\"red\", 2:\"green\")", "var colors = new Array(\"red\", \"green\", \"blue\")"],
        answer: "var colors = [\"red\", \"green\", \"blue\"]"
    },
    {
        question: "Which HTML tag is used to define an internal style sheet?",
        options: ["<script>", "<css>", "<style>", "<link>"],
        answer: "<style>"
    },
    {
        question: "In CSS, what does the 'C' stand for?",
        options: ["Creative", "Cascading", "Colorful", "Computer"],
        answer: "Cascading"
    },
    {
        question: "Which JavaScript function is used to print content to the console?",
        options: ["console.print()", "log()", "console.write()", "console.log()"],
        answer: "console.log()"
    },
    {
        question: "What is the primary purpose of the HTML `<head>` element?",
        options: ["To contain the main visible content of the document.", "To define a header for a section or document.", "To contain meta-information about the HTML document.", "To display important links at the top of the page."],
        answer: "To contain meta-information about the HTML document."
    },
    {
        question: "Which CSS layout property is best for aligning items in a single row or column?",
        options: ["Grid", "Float", "Inline-block", "Flexbox"],
        answer: "Flexbox"
    },
    {
        question: "Which keyword is used to declare a constant variable in JavaScript?",
        options: ["var", "let", "const", "static"],
        answer: "const"
    }
];

// --- Global Variables and Constants ---
const QUIZ_TIME_SECONDS = 120; 

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = QUIZ_TIME_SECONDS;
let questions = []; 
let currentUser = null; // Stores the logged-in user's username

// --- DOM Element References ---
// Auth Screens
const initialStartScreen = document.getElementById('initial-start-screen');
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const quizStartScreen = document.getElementById('quiz-start-screen');

// Quiz Screens 
const questionScreen = document.getElementById('question-screen');
const resultsScreen = document.getElementById('results-screen');

// Buttons and Toggles
const authStartBtn = document.getElementById('auth-start-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const goToSignupLink = document.getElementById('go-to-signup');
const goToLoginLink = document.getElementById('go-to-login');
const quizStartBtn = document.getElementById('quiz-start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const logoutBtn = document.getElementById('logout-btn');

// Display Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const finalScoreText = document.getElementById('final-score-text');
const feedbackMessageEl = document.getElementById('feedback-message');
const userStatusEl = document.getElementById('user-status');
const welcomeUserEl = document.getElementById('welcome-user');
const loginErrorEl = document.getElementById('login-error');
const signupErrorEl = document.getElementById('signup-error');


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Auth Flow
authStartBtn.addEventListener('click', () => showScreen(loginScreen));
goToSignupLink.addEventListener('click', (e) => { e.preventDefault(); showScreen(signupScreen); });
goToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showScreen(loginScreen); });
loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);
logoutBtn.addEventListener('click', handleLogout);

// Quiz Flow
quizStartBtn.addEventListener('click', startQuiz); 
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', resetQuiz);

// --- AUTHENTICATION LOGIC (Dummy/Client-Side using localStorage) ---

function getUsers() {
    return JSON.parse(localStorage.getItem('quizUsers')) || [];
}

function saveUsers(users) {
    localStorage.setItem('quizUsers', JSON.stringify(users));
}

function checkAuthStatus() {
    currentUser = localStorage.getItem('quizLoggedInUser');
    if (currentUser) {
        // User is logged in, show the Quiz Start screen
        updateUserDisplay(currentUser);
        showScreen(quizStartScreen);
    } else {
        // No user logged in, show the Initial Start screen
        updateUserDisplay(null);
        showScreen(initialStartScreen);
    }
}

function updateUserDisplay(username) {
    if (username) {
        userStatusEl.innerHTML = `<i class="fas fa-user-circle"></i> ${username}`;
        welcomeUserEl.textContent = username;
        timerEl.classList.remove('hidden');
        progressEl.classList.remove('hidden');
    } else {
        userStatusEl.innerHTML = `<i class="fas fa-user-circle"></i> Guest`;
        // Hide the timer/progress until the user logs in and starts the quiz
        timerEl.classList.add('hidden'); 
        progressEl.classList.add('hidden');
    }
}

function handleSignup() {
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    signupErrorEl.textContent = '';
    if (!username || !email || !password) {
        signupErrorEl.textContent = 'All fields are required.';
        return;
    }
    if (password.length < 4) {
        signupErrorEl.textContent = 'Password must be at least 4 characters.';
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        signupErrorEl.textContent = 'An account with this email already exists.';
        return;
    }

    users.push({ username, email, password }); 
    saveUsers(users);
    
    // Auto-login after successful signup
    localStorage.setItem('quizLoggedInUser', username);
    checkAuthStatus(); // Redirects to quiz-start-screen
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    loginErrorEl.textContent = '';
    if (!email || !password) {
        loginErrorEl.textContent = 'Email and password are required.';
        return;
    }

    const users = getUsers();
    // Simulate authentication
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('quizLoggedInUser', user.username);
        checkAuthStatus(); // Redirects to quiz-start-screen
    } else {
        loginErrorEl.textContent = 'Invalid email or password.';
    }
}

function handleLogout() {
    localStorage.removeItem('quizLoggedInUser');
    currentUser = null;
    checkAuthStatus(); // Redirects to initial-start-screen
}

// --- CORE QUIZ FUNCTIONS ---

function startQuiz() {
    // 1. Reset state
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = QUIZ_TIME_SECONDS;
    
    // 2. Shuffle questions
    questions = [...quizData];
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // 3. Start Timer and show first question
    startTimer();
    showScreen(questionScreen);
    loadQuestion();
}

function startTimer() {
    clearInterval(timer); 
    
    const initialMinutes = Math.floor(QUIZ_TIME_SECONDS / 60);
    const initialSeconds = QUIZ_TIME_SECONDS % 60;
    const initialTimeString = `${initialMinutes.toString().padStart(2, '0')}:${initialSeconds.toString().padStart(2, '0')}`;
    timerEl.innerHTML = `<i class="fas fa-clock"></i> ${initialTimeString}`;

    timer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerEl.innerHTML = `<i class="fas fa-clock"></i> ${timeString}`;

        if (timeLeft <= 10) {
            timerEl.style.color = '#ef4444'; 
        } else {
            timerEl.style.color = 'var(--error-color)'; 
        }

        if (timeLeft <= 0) {
            endQuiz(true); 
        }
    }, 1000);
}

function loadQuestion() {
    const currentQ = questions[currentQuestionIndex];
    
    progressEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    questionText.textContent = currentQ.question;
    optionsContainer.innerHTML = ''; 
    nextBtn.classList.add('hidden');
    nextBtn.disabled = true;

    currentQ.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(button, option, currentQ.answer));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedButton, selectedOption, correctAnswer) {
    Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);
    
    if (selectedOption === correctAnswer) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        Array.from(optionsContainer.children)
            .find(btn => btn.textContent === correctAnswer)
            .classList.add('correct');
    }

    nextBtn.classList.remove('hidden');
    nextBtn.disabled = false;
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        endQuiz(false);
    }
}

function endQuiz(timedOut) {
    clearInterval(timer);
    showScreen(resultsScreen);

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    finalScoreText.textContent = `${score} / ${totalQuestions} (${percentage}%)`;

    let message = '';
    if (timedOut) {
        message = "Time's up! You ran out of time.";
        feedbackMessageEl.style.color = 'var(--error-color)';
    } else if (percentage === 100) {
        message = "Excellent job! Perfect score!";
        feedbackMessageEl.style.color = 'var(--success-color)';
    } else if (percentage >= 70) {
        message = "Great effort! Solid web development knowledge!";
        feedbackMessageEl.style.color = 'var(--primary-color)';
    } else if (percentage >= 40) {
        message = "Good start! Focus on strengthening your core concepts.";
        feedbackMessageEl.style.color = '#f59e0b';
    } else {
        message = "Needs work. Review the basics and try again!";
        feedbackMessageEl.style.color = 'var(--error-color)';
    }
    feedbackMessageEl.textContent = message;
}

function resetQuiz() {
    // Go back to the quiz start page
    clearInterval(timer);
    timerEl.style.color = 'var(--error-color)';
    timerEl.innerHTML = `<i class="fas fa-clock"></i> 00:00`;
    progressEl.textContent = 'Question 0 of 0';
    showScreen(quizStartScreen); 
}

// --- Screen Switching Helper ---
function showScreen(screenToShow) {
    const screens = [initialStartScreen, loginScreen, signupScreen, quizStartScreen, questionScreen, resultsScreen];
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
    // Hide error messages when switching screens
    loginErrorEl.textContent = '';
    signupErrorEl.textContent = '';
    
    screenToShow.classList.remove('hidden');
}