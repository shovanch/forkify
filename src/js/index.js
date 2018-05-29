import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import { elements, renderLoader, clearLoader } from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes object
 **/

const state = {};
window.state = state;

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
    } catch (error) {
      alert("Error in Recipeview");
      console.log(error);
    }

    // Render recipe
    clearLoader();
    recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
  }
};

// fire controlrecipe if the hashchange or on pageload
["hashchange", "load"].forEach(event => addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 **/
const controlList = () => {
  // create a new list, if none exists yet
  if (!state.list) state.list = new List();

  // Add all the ingredients to the list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItems(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Delete and update list items
elements.shopping.addEventListener("click", e => {
  // get the id of the clicked element
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // delete and update the list
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    // get the new value
    const value = parseFloat(e.target.value, 10);
    // Update in list
    state.list.updateItems(id, value);
  }
});

/**
 * LIKES CONTROLLER
 **/
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;

  // if user has not liked the recipe yet
  if (!state.likes.isLiked(currentId)) {
    // add liked recipe to state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // toggle the like button
    likesView.toggleLikeBtn(true);
    // add liked recipe to liked-list UI
    likesView.rednerLikeMenu(newLike);
  } else {
    // remove liked recipe from state
    state.likes.deleteLike(currentId);
    // toggle the like button
    likesView.toggleLikeBtn(false);

    // remove liked recipe from liked-list UI
    likesView.deleteLike(currentId);
  }

  likesView.toggleLikeMenu(state.likes.likesCount());
};

// on pageload, restore likes from localstorage
window.addEventListener("load", () => {
  state.likes = new Likes();

  // read the data from localstorage
  state.likes.readData();

  // render the items to the list menu
  state.likes.likes.forEach(like => likesView.renderLikeMenu(like));

  // set list-menu btn visibity
  likesView.toggleLikeMenu(state.likes.likesCount());
});

/**
 * HANDLING SHOPPING LIST EVENTS
 **/
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
  } else if (e.target.matches(".recipe__btn-add, .recipe__btn-add *")) {
    // add ingredients to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});
