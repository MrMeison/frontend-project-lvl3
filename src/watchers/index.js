import onChange from 'on-change';
import handleForm from './form.js';
import handleLoadingState from './loadingState.js';
import handleFeeds from './feed.js';

export default (state, formElements) => onChange(state, (path) => {
  switch (path) {
    case 'form':
      handleForm(state, formElements);
      break;
    case 'loadingState':
      handleLoadingState(state, formElements);
      break;
    case 'feeds':
    case 'posts':
      handleFeeds(state, formElements);
      break;
    default:
      break;
  }
});
