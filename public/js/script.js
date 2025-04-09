document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        // Send POST request to your backend
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        alert(result.message || "Form submitted successfully!");
        contactForm.reset();
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Failed to submit form. Please try again.");
      }
    });
  }
});