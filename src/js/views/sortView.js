import View from './View.js';
import previewView from './previewView.js';

class SortView extends View {
  _parentElement = document.querySelector('.dropdown-content');
  _errorMessage = 'No recipes found for that search query! Please try again!';
  _message = '';

  addHandlerSort(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.sortOption');
      if (!btn) return;

      handler(btn);
    });
  }
}

export default new SortView();
