const renderForm = (state, formElements) => {
  const { form: { valid, error } } = state;
  const { input, feedback } = formElements;

  if (valid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
  }
};

export default (state, formElements) => {
  renderForm(state, formElements);
};
