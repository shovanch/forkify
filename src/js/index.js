import Search from "./models/Search";
import { elements, renderLoader, clearLoader } from "./views/base";
import * as searchView from "./views/searchView";

/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes object
 */

const state = {};
const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.getInput();
  // If query found
  if (query) {
    // 2. New search object and add it to state
    state.search = new Search(query);

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResults);

    // 4. Search for recipes
    await state.search.getResults();

    // 5. Render results to the UI
    clearLoader();
    searchView.renderResults(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResultsPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();

    searchView.renderResults(state.search.result, goToPage);
  }
});
