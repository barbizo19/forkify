import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import sortView from './views/sortView.js';

// Reminder: Polyfilling provides modern functionality (ES6 features) to older browers
import 'core-js/stable'; // Polyfill everything else
import 'regenerator-runtime/runtime'; // Polyfill async/await

// This is so the state of the page stays the same when we change the code
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1); // window.location = entire URL

    if (!id) return; // If there's no hash, the fetch would point to somewhere undefined, so we use a guard clause here
    recipeView.renderSpinner();

    // 0) Update resultsView to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Update bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinner();
    console.log(resultsView);
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = goToPage => {
  // This works because the render method uses the clear method
  // Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = newServings => {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view. just call the render method on the recipeView so we don't have to individually select elements and update them
  // recipeView.render(model.state.recipe);
  // That's a bit overkill for just a small number of value changing. we'll create a method called update which only updates the selected DOM elements
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  // 1) Add or remove a bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async newRecipe => {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    //console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Render success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL using the history API of the browsers
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🔮', err);
    addRecipeView.renderError(err.message);
  }

  // Upload the new recipe
};

const controlSort = btn => {
  //sort results
  model.sortResults(btn.id);

  // Re render results
  resultsView.render(model.getSearchResultsPage());

  // Render initial pagination
  paginationView.render(model.state.search);
};

// Publisher-Subscriber Pattern. addHandlerRender is the publisher. it publishes events using the addEventListener. controlRecipes is the subscriber. it subscribes to addHandlerRender because it is the callback function ofaddHandlerRender. we use the PS pattern to keep event listeners in the view (presentation logic) and control functions (application logic) in the controller.
const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  sortView.addHandlerSort(controlSort);
};
init();
