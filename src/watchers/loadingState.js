import i18next from 'i18next';

const toggleInputState = (input, disabled) => {
  input.disabled = disabled;
  if (disabled) {
    input.setAttribute('readonly', 'readonly');
  } else {
    input.removeAttribute('readonly');
  }
  
};

const handleLoadingState = (state, formElements) => {
  const { loadingState } = state;
  const { feedbackBox, form, input } = formElements;

  switch (loadingState.status) {
    case 'failed':
      toggleInputState(input, false);
      feedbackBox.classList.add('text-danger');
      feedbackBox.textContent = loadingState.error;
      break;
    case 'idle':
      form.reset();
      toggleInputState(input, false);
      input.focus();
      feedbackBox.classList.add('text-success');
      feedbackBox.textContent = i18next.t('loading.success');
      break;
    case 'loading':
      toggleInputState(input, true);
      feedbackBox.classList.remove('text-success');
      feedbackBox.classList.remove('text-danger');
      feedbackBox.textContent = '';
      break;
    default:
      toggleInputState(input, true);
      feedbackBox.classList.add('text-danger');
      feedbackBox.textContent = i18next.t('loading.unknownError');
      throw new Error(`Unknown status: '${loadingState.status}'`);
  }
};

export default (state, formElements) => {
  handleLoadingState(state, formElements);
};
