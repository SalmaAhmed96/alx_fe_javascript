let quotes = [];

// Load quotes from local storage on initialization
function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to post a quote to the server
async function postQuoteToServer(quote) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quote)
  });
  const data = await response.json();
  console.log('Quote posted to server:', data);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const serverQuotes = await response.json();
  return serverQuotes.map(quote => ({ text: quote.title, category: 'Server' }));
}

// Periodically fetch data from the server
function setupPeriodicFetching(interval) {
  setInterval(async () => {
    await syncQuotes();
  }, interval);
}

// Sync with server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Compare local and server quotes
  const newQuotes = serverQuotes.filter(serverQuote => !quotes.some(localQuote => localQuote.text === serverQuote.text));
  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    document.getElementById('conflictNotification').textContent = 'Quotes synced with server!';
    document.getElementById('conflictNotification').style.display = 'block';
    setTimeout(() => {
      document.getElementById('conflictNotification').style.display = 'none';
    }, 5000); // Hide the notification after 5 seconds
    populateCategories();
    filterQuotes();
  }
}

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>No quotes available.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p><p><em>${quotes[randomIndex].category}</em></p>`;
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    console.log(quotes);

    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');

    saveQuotes();
    postQuoteToServer(newQuote); // Post the new quote to the server
    populateCategories();
    filterQuotes();
  } else {
    alert('Please fill in both fields');
  }
}

// Function to create and append the form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Quote';
  addButton.onclick = addQuote;

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Clear existing options

  const categories = [...new Set(quotes.map(quote => quote.category))];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const quoteDisplay = document.getElementById('quoteDisplay');

  if (selectedCategory === 'all') {
    quoteDisplay.innerHTML = quotes.map(quote => `<p>${quote.text}</p><p><em>${quote.category}</em></p>`).join('');
  } else {
    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    quoteDisplay.innerHTML = filteredQuotes.map(quote => `<p>${quote.text}</p><p><em>${quote.category}</em></p>`).join('');
  }

  localStorage.setItem('selectedCategory', selectedCategory);
}

// Function to load the last selected filter from local storage
function loadSelectedFilter() {
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    document.getElementById('categoryFilter').value = savedCategory;
    filterQuotes();
  }
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'quotes.json');
  a.click();
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
    populateCategories();
    filterQuotes();
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize the form and categories
createAddQuoteForm();
populateCategories();
loadSelectedFilter();
loadQuotes();
setupPeriodicFetching(300000); // Fetch updates every 5 minutes

// Initial quote display
showRandomQuote();
