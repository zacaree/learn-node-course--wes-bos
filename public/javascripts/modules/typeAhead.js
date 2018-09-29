const axios = require('axios');

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    // If there is not value, quit it! Hide the results.
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop
    }
    // Show the search results
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = searchResultsHTML(res.data);
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // If the user isn't pressing up, down or enter then ignore it
    if (![40, 38, 13].includes(e.keyCode)) {
      return; // Ignore
    }
    const activeClass = 'search__result--active';
  })
}

export default typeAhead;