import Search from "./models/Search";
import Recipe from "./models/Recipe";
import { elements, renderLoader, clearLoader } from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";

/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes object
 */

const state = {};

/**
 * SEARCH CONTROLLER
 **/
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

    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results to the UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Error in search");
      clearLoader();
    }
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

/**
 * RECIPE CONTROLLER
 **/
const controlRecipe = async () => {
  // Get recipe ID from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for results
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight the selected item, if the seacrch has been done
    if (state.search) searchView.hightlightActive(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      console.log(state.recipe);
    } catch (error) {
      alert("Error in Recipeview");
      console.log(error);
    }

    // Render recipe
    clearLoader();
    recipeView.renderRecipe(state.recipe);
  }
};

// fire controlrecipe if the hashchange or on pageload
["hashchange", "load"].forEach(event => addEventListener(event, controlRecipe));

// Update servings button event handler
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // decrease button clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateRecipeServings(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // increase button clicked
    state.recipe.updateServings("inc");
    recipeView.updateRecipeServings(state.recipe);
  }

  console.log(state.recipe);
});
