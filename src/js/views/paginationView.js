import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.btn--inline'); // Reminder the closest method looks for parent elements
      if (!btn) return;
      const goToPage = +btn.dataset.goto; //unary operator. convert to number
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const currPage = this._data.page;
    const nextButtonMarkup = `<button data-goto="${
      currPage + 1
    }" class="btn--inline pagination__btn--next">
    <span>Page ${currPage + 1}</span>
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-right"></use>
    </svg>
    </button>`;
    const prevButtonMarkup = `<button data-goto="${
      currPage - 1
    }" class="btn--inline pagination__btn--prev">
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-left"></use>
    </svg>
    <span>Page ${currPage - 1}</span>
    </button>`;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    console.log(numPages);
    const numPagesMarkup = `<span class="page-indicator" id="pageIndicator">Page ${currPage} of ${numPages}</span>`;

    const numPagesMarkupPage1 = `<span class="page-indicator-firstPage" id="pageIndicator">Page ${currPage} of ${numPages}</span>`;
    // Page 1, and there are other pages
    if (currPage === 1 && numPages > 1) {
      //document.getElementById('pageIndicator').style.marginLeft = '1.2rem';
      return numPagesMarkupPage1 + nextButtonMarkup;
    }
    // Page 1, and there are NO other options
    if (currPage === 1 && numPages === 1) {
      return '';
    }
    // Last Page
    if (currPage === numPages && numPages > 1) {
      return prevButtonMarkup + numPagesMarkup;
    }
    // Other Page
    if (currPage < numPages) {
      return prevButtonMarkup + numPagesMarkup + nextButtonMarkup;
    }
  }
}

export default new PaginationView();
