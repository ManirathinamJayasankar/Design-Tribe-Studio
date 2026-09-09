const inquiryForm = document.getElementById("inquiry-form");
const inquiryStatus = document.getElementById("inquiry-status");
const inquirySubmit = inquiryForm.querySelector(".inquiry-submit");

function setStatus(text, isError) {
  inquiryStatus.textContent = text;
  inquiryStatus.classList.toggle("is-error", Boolean(isError));
}

// No-JS fallback: Netlify redirects back here after a native POST.
if (new URLSearchParams(window.location.search).get("submitted") === "1") {
  setStatus("Thanks! Your message has been sent. We'll get back to you soon.");
  window.history.replaceState({}, "", window.location.pathname);
}

inquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;

  const body = new URLSearchParams(new FormData(inquiryForm)).toString();
  inquirySubmit.disabled = true;
  setStatus("Sending your message…");

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) throw new Error("Netlify responded with " + response.status);
    inquiryForm.reset();
    setStatus("Thanks! Your message has been sent. We'll get back to you soon.");
  } catch (error) {
    console.error("Form submission failed", error);
    setStatus("Sorry, something went wrong. Please email us at hello@uxuistudio.in.", true);
  } finally {
    inquirySubmit.disabled = false;
  }
});
