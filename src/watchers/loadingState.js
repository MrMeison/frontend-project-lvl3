const toggleInputState = (input, disabled) => {
  input.disabled = disabled;
  input.setAttribute('readonly', disabled);
};

const handleLoadingState = (state, formElements) => {
  const { loadingState } = state;
  const { feedback, form, input } = formElements;

  switch (loadingState.status) {
    case 'failed':
      toggleInputState(input, false);
      feedback.classList.add('text-danger');
      feedback.textContent = loadingState.error;
      break;
    case 'idle':
      form.reset();
      input.focus();
      feedback.classList.add('text-success');
      feedback.textContent = 'Rss has been loaded';
      break;
    case 'loading':
      toggleInputState(input, true);
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      break;
    default:
      toggleInputState(input, true);
      feedback.classList.add('text-danger');
      feedback.textContent = 'Unknown error. Try again';
      throw new Error(`Unknown status: '${loadingState.status}'`);
  }
};

export default (state, formElements) => {
  handleLoadingState(state, formElements);
};
