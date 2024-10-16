let quotes = [];


function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}


function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}


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


async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const serverQuotes = await response.json();
  return serverQuotes.map(quote => ({ text: quote.title, category: 'Server' }));
}


function setupPeriodicFetching(interval) {
  setInterval(async () => {
    await syncQuotes();
  }, interval);
}


async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();


  const newQuotes = serverQuotes.filter(serverQuote => !quotes.some(localQuote => localQuote.text === serverQuote.text));
  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    document.getElementById('conflictNotification').style.display = 'block';
    populateCategories();
    filterQuotes();


    setTimeout(() => {
      document.getElementById('conflictNotification').style.display = 'none';
    }, 3000);
  }
}



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


document.getElementById('newQuote').addEventListener('click', showRandomQuote);


function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    console.log(quotes);


    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');

    saveQuotes();
    postQuoteToServer(newQuote);
    populateCategories();
    filterQuotes();
  } else {
    alert('Please fill in both fields');
  }
}


function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput
}