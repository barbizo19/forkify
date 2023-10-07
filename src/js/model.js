import { API_URL, RESULTS_PER_PAGE, KEY } from './config.js';
//import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
  recipes: [],
};

const createRecipeObject = data => {
  const { recipe } = data.data;

  console.log(recipe);
  // We will conditionally add the key property. we use the spread operator because if recipe.key exists then the result of the expression is the object { key: recipe.key }. then we have to spread that object into the overall recipe object
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async id => {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

    console.log(state.recipe);
  } catch (err) {
    // We rethrow the error here becuase if getJSON fails the error will be handled here and the loadRecipe promise will still be fufilled. We want the error to be handled in the controller
    throw err;
  }
};

const loadSearchRecipes = async recipeArray => {
  recipeArray.forEach(recipe => {
    const data = fetch(`${API_URL}${recipe.id}?key=${KEY}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Recipe search is faulty');
        }
      })
      .then(data => {
        state.recipes.push(data.data.recipe);
      });
  });
  console.log(state.recipes);
};

export const loadSearchResults = async query => {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.page = 1;
    loadSearchRecipes(state.search.results);
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = (page = state.search.page) => {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = newServings => {
  state.recipe.ingredients.forEach(
    //newQuantity = oldQuantity * new serving / old serving
    ing => (ing.quantity = (ing.quantity * newServings) / state.recipe.servings)
  );

  state.recipe.servings = newServings;
};

const persistBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = recipe => {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = id => {
  // Delete bookmark
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);

  console.log(id, state.recipe.id);
  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  console.log('recipe bookmark flag is: ' + state.recipe.bookmarked);

  persistBookmarks();
};

const init = () => {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

console.log(state.bookmarks);

const clearBookmarks = () => {
  localStorage.clear('bookmarks');
};
//clearBookmarks();

export const uploadRecipe = async newRecipe => {
  try {
    console.log(Object.entries(newRecipe));
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        //const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export const sortResults = sortType => {
  if (sortType === 'duration') {
    state.recipes.sort((a, b) => a.cooking_time - b.cooking_time);
  }
  if (sortType === 'noIngredients') {
    state.recipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
  }
  state.search.results = recipesToResults(state.recipes);
  console.log(state.search.results);
};

const recipesToResults = recipes => {
  let resultArr = [];
  console.log(recipes);
  resultArr = recipes.map(recipe => {
    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      image: recipe.image_url,
      ...(recipe.key && { key: recipe.key }),
    };
  });
  return resultArr;
};
