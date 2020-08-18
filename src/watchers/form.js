const renderForm = (state, formElements) => {
  const { form: { valid, error } } = state;
  const { input, feedbackBox } = formElements;

  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedbackBox.classList.add('text-danger');
    feedbackBox.textContent = error;
  }
};

export default (state, formElements) => {
  renderForm(state, formElements);
};
