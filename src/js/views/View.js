import icons from 'url:../../img/icons.svg';

// Exporting the whole class here because we want to use it many times over, with everything that extends it
export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data we expect an object or an array of objects. this is the data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] braces mean this paramter is optional. if false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} if render=false then a markup string is returned
   * @this {Object} View instance
   * @author Ben Arbizo
   * @todo finish implementation
   */
  render(data, render = true) {
    // If there is no data or there is data but that data is an array but empty return immdeiately and render the error
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    //console.log(this._parentElement);
    // Convert the markup string to a virtual DOM object which lives in memory
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const currEl = currElements[i];
      //console.log(currEl, newEl, newEl.isEqualNode(currEl));

      // If the new element doesn't equal the current element and the nodeValue property of the text node isn't empty, that means we found a new text element. newEl is just an element. it's firstChild is the text node. elements who do not contain text directly will return null for the nodeValue property
      // Updating changed TEXT
      if (
        !newEl.isEqualNode(currEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // console.log(
        //   '🔮 current element value: ',
        //   currEl.firstChild.nodeValue.trim()
        // );
        // console.log(
        //   '🔮 new element value: ',
        //   newEl.firstChild.nodeValue.trim()
        // );
        currEl.textContent = newEl.textContent;
      }

      // Updating changed ATTRIBUTES
      if (!newEl.isEqualNode(currEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          currEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }
  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
      <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
      </div>
      <p>${message}</p>
    </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `<div class="message">
      <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
      </div>
      <p>${message}</p>
    </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
