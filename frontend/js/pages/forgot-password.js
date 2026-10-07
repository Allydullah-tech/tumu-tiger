(function () {
  loadPartial('navbar-placeholder', '/partials/navbar.html');
  loadPartial('footer-placeholder', '/partials/footer.html');

  const alertBox = document.getElementById('alertBox');
  const stepEmailForm = document.getElementById('stepEmailForm');
  const stepAnswerForm = document.getElementById('stepAnswerForm');
  const stepResetForm = document.getElementById('stepResetForm');
  const questionLabel = document.getElementById('securityQuestionLabel');

  stepEmailForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = new FormData(stepEmailForm).get('email');
    try {
      const { security_question } = await apiPostJSON('/auth/forgot_find.php', { email });
      questionLabel.textContent = security_question;
      stepEmailForm.style.display = 'none';
      stepAnswerForm.style.display = 'block';
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });

  stepAnswerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const answer = new FormData(stepAnswerForm).get('security_answer');
    try {
      await apiPostJSON('/auth/forgot_verify.php', { security_answer: answer });
      stepAnswerForm.style.display = 'none';
      stepResetForm.style.display = 'block';
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });

  stepResetForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(stepResetForm);
    try {
      await apiPostJSON('/auth/forgot_reset.php', {
        password: fd.get('password'),
        confirm_password: fd.get('confirm_password'),
      });
      showAlert(alertBox, 'Nenosiri limebadilishwa. Sasa unaweza kuingia.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
      showAlert(alertBox, err.message);
    }
  });
})();
