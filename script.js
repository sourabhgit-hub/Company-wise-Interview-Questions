// DOM elements
const companyListElement = document.getElementById('company-list');
const questionListElement = document.getElementById('question-list');
const companyNameElement = document.getElementById('company-name');
const questionsElement = document.getElementById('questions');
const backButton = document.getElementById('back-button');

// Base URL for fetching CSV files
const baseUrl = 'https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/';

// Back button functionality
backButton.addEventListener('click', () => {
    companyListElement.style.display = 'block';
    questionListElement.style.display = 'none';
});

// Function to format company names
function properName(str) {
    return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()).replace('_alltime.csv', '');
}

// Global variables to track current company and questions
let currentCompanyName = '';
let currentQuestions = [];

// Function to save checkbox state to localStorage
function saveCheckboxState(questionId, isChecked) {
    let completedQuestions = JSON.parse(localStorage.getItem('completedQuestions')) || {};
    completedQuestions[questionId] = isChecked;
    localStorage.setItem('completedQuestions', JSON.stringify(completedQuestions));
}

// Function to load checkbox state from localStorage
function loadCheckboxState(questionId) {
    let completedQuestions = JSON.parse(localStorage.getItem('completedQuestions')) || {};
    return completedQuestions[questionId] || false;
}

// Function to sort questions based on criteria and order
function sortQuestions(questions, criteria, order) {
    if (criteria === 'ID') {
        questions.sort((a, b) => order === 'asc' ? a[criteria] - b[criteria] : b[criteria] - a[criteria]);
    } else if (criteria === 'Difficulty') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        questions.sort((a, b) => order === 'asc' ? difficultyOrder[a[criteria]] - difficultyOrder[b[criteria]] : difficultyOrder[b[criteria]] - difficultyOrder[a[criteria]]);
    }
}

// Function to search companies
function searchCompanies() {
    const searchInput = document.getElementById('company-search').value.toUpperCase();
    const companies = document.getElementById('company-list').getElementsByClassName('company');

    Array.from(companies).forEach(company => {
        const companyName = company.innerText.toUpperCase();
        if (companyName.includes(searchInput)) {
            company.style.display = 'block';
        } else {
            company.style.display = 'none';
        }
    });
}

// Function to search questions
function searchQuestions() {
    const searchInput = document.getElementById('question-search').value.toUpperCase();
    const questions = Array.from(document.querySelectorAll('#questions tbody tr'));

    questions.forEach(question => {
        const cells = question.getElementsByTagName('td');
        let found = false;
        Array.from(cells).forEach(cell => {
            if (cell.innerText.toUpperCase().includes(searchInput)) {
                found = true;
            }
        });
        if (found) {
            question.style.display = '';
        } else {
            question.style.display = 'none';
        }
    });
}

// Function to display questions with optional sorting criteria
function displayQuestions(companyName, questions, sortCriteria = null) {
    currentCompanyName = companyName;
    currentQuestions = questions;

    // Sort questions based on sortCriteria if provided
    if (sortCriteria) {
        sortQuestions(questions, sortCriteria.criteria, sortCriteria.order);
    }

    // Update company name display
    companyNameElement.innerText = properName(companyName);
    questionsElement.innerHTML = ''; // Clear previous questions

    // Create table element
    const table = document.createElement('table');
    table.className = 'question-table';

    // Create table header
    const header = table.createTHead();
    const headerRow = header.insertRow();

    // Checkbox column header
    const checkboxHeader = document.createElement('th');
    checkboxHeader.innerText = 'Done';
    headerRow.appendChild(checkboxHeader);

    // Create table columns
    const columns = Object.keys(questions[0]); // Assumes all questions have the same columns
    columns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'table-header';

        // Handle 'ID' or 'Difficulty' columns
        if (col === 'ID' || col === 'Difficulty') {
            const columnContainer = document.createElement('div');
            columnContainer.className = 'header-container';

            // Text for 'ID' or 'Difficulty'
            const columnHeader = document.createElement('span');
            columnHeader.className = 'header-text';
            columnHeader.innerText = col;

            // Sort button and icon
            const sortButton = document.createElement('span');
            sortButton.className = 'sort-button';
            sortButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M18.695 9.378L12.83 3.769a1.137 1.137 0 00-.06-.054c-.489-.404-1.249-.377-1.7.06L5.303 9.381a.51.51 0 00-.16.366c0 .297.27.539.602.539h12.512a.64.64 0 00.411-.146.501.501 0 00.028-.762zM12.77 20.285c.021-.017.042-.035.062-.054l5.863-5.609a.5.5 0 00-.028-.762.64.64 0 00-.41-.146H5.743c-.332 0-.601.242-.601.54a.51.51 0 00.16.365l5.769 5.606c.45.437 1.21.464 1.698.06z"></path></svg>';

            // Add click event listener to toggle sorting
            sortButton.addEventListener('click', () => {
                toggleSortOrder(col);
            });

            // Append elements to container
            columnContainer.appendChild(columnHeader);
            columnContainer.appendChild(sortButton);

            // Append container to table header cell
            th.appendChild(columnContainer);
        } else if (col === 'Leetcode Question Link') {
            th.innerText = 'Practise';
        } else {
            th.innerText = col; // Display column name
        }

        // Append header cell to header row
        headerRow.appendChild(th);
    });

    // Create table body
    const tbody = document.createElement('tbody');
    questions.forEach(question => {
        const row = tbody.insertRow();

        // Create checkbox cell
        const checkboxCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const questionId = question['ID']; // Unique identifier for question

        // Load checkbox state
        checkbox.checked = loadCheckboxState(questionId);

        // Save checkbox state on change
        checkbox.addEventListener('change', () => {
            saveCheckboxState(questionId, checkbox.checked);
        });

        // Append checkbox to cell
        checkboxCell.appendChild(checkbox);

        // Populate table cells with question data
        columns.forEach(col => {
            const cell = row.insertCell();
            if (col === 'Leetcode Question Link') {
                const link = document.createElement('a');
                link.href = question[col];
                link.target = '_blank';
                link.innerText = 'Solve';
                cell.appendChild(link);
            } else {
                cell.innerText = question[col]; // Display question data
            }
        });
    });

    // Append table body to table element
    table.appendChild(tbody);

    // Append table to questions element
    questionsElement.appendChild(table);

    // Show question list and hide company list
    companyListElement.style.display = 'none';
    questionListElement.style.display = 'block';
}

// Function to toggle sorting order of questions
function toggleSortOrder(sortBy) {
    const currentOrder = questionsElement.getAttribute(`data-${sortBy}-order`) || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    questionsElement.setAttribute(`data-${sortBy}-order`, newOrder);
    displayQuestions(currentCompanyName, currentQuestions, { criteria: sortBy, order: newOrder });
}

// Function to fetch and display questions for a given company
async function fetchAndDisplayQuestions(fileName) {
    try {
        const csvData = await fetchCSV(fileName); // Fetch CSV data
        const questions = parseCSV(csvData); // Parse CSV into array of objects
        displayQuestions(fileName, questions); // Display questions in UI
    } catch (error) {
        console.error('Failed to fetch or display questions:', error);
    }
}

// Function to fetch CSV data from GitHub repository
async function fetchCSV(fileName) {
    const response = await fetch(`${baseUrl}${fileName}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}`);
    }
    return response.text(); // Return CSV data as text
}

// Function to parse CSV data into array of objects
function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const questions = [];

    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        if (data.length === headers.length) {
            const question = {};
            for (let j = 0; j < headers.length; j++) {
                question[headers[j].trim()] = data[j].trim();
            }
            questions.push(question); // Add question object to array
        }
    }

    return questions; // Return array of question objects
}

// Fetch and display list of companies when page loads
fetchAndDisplayCompanies();

// Function to fetch list of companies from GitHub repository
async function fetchAndDisplayCompanies() {
    try {
        const response = await fetch('https://api.github.com/repos/krishnadey30/LeetCode-Questions-CompanyWise/contents/');
        const files = await response.json();
        const csvFiles = files.filter(file => file.name.endsWith('_alltime.csv'));

        // Create company list elements
        csvFiles.forEach(file => {
            const companyElement = document.createElement('div');
            companyElement.className = 'company';
            companyElement.innerText = properName(file.name);
            companyElement.onclick = () => fetchAndDisplayQuestions(file.name); // Fetch and display questions on click
            companyListElement.appendChild(companyElement); // Append company element to company list
        });
    } catch (error) {
        console.error('Failed to fetch or display companies:', error);
    }
}
