import axios from 'axios';
import dompurify from 'dompurify'; // This library is designed to protect us from XSS attacks when setting innerHTML

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
  // If somehow there is no search element, stop the function now
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  // .on is identical to an event listener. It's available to us because of Bling.js
  searchInput.on('input', function() {
    // If there is not value, quit it! Hide the results.
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop
    }
    // Show the search results
    searchResults.style.display = 'block';

    // Axios is just a fetch library with perks
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // Tell the user that nothing came back from the DB
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for "${this.value}" found.</div>`);
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
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) { // If down is pressed and there is already an active item in the list then make the next item active or the first item.
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) { // If none are active yet then "next" becomes the first item in the list, making it active.
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keycode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) { // If enter is pressed and the current element has a link
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;