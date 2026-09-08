const inquiryForm = document.getElementById("inquiry-form");
inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const values = new FormData(inquiryForm);
  const name = String(values.get("name")).trim();
  const email = String(values.get("email")).trim();
  const message = String(values.get("message")).trim();
  const subject = encodeURIComponent("Website inquiry from " + name);
  const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
  document.getElementById("inquiry-status").textContent = "Opening your email app with a draft. Please send it there to complete your inquiry.";
  window.location.href = "mailto:hello@uxuistudio.in?subject=" + subject + "&body=" + body;
});
