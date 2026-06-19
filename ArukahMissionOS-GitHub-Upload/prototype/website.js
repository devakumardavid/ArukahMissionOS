const header = document.querySelector(".site-header");
const menuButton = document.querySelector("#public-menu");
const nav = document.querySelector("#public-nav");
const contactForm = document.querySelector("#public-contact-form");
const formStatus = document.querySelector("#form-status");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

contactForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`Arukah enquiry: ${data.get("interest")}`);
  const body = encodeURIComponent(
    `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nInterest: ${data.get("interest")}\n\n${data.get("message")}`
  );
  formStatus.textContent = "Opening your email application…";
  window.location.href = `mailto:hello@arukahmissions.org?subject=${subject}&body=${body}`;
});
