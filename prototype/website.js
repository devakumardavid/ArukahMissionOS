const header = document.querySelector(".site-header");
const menuButton = document.querySelector("#public-menu");
const nav = document.querySelector("#public-nav");
const contactForm = document.querySelector("#public-contact-form");
const formStatus = document.querySelector("#form-status");
const assistantToggle = document.querySelector("#assistant-toggle");
const assistantClose = document.querySelector("#assistant-close");
const assistantPanel = document.querySelector("#assistant-panel");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const missionOsUrl = window.ARUKAH_CONFIG?.missionOsUrl || "http://localhost:3000";

const assistantReplies = {
  pledge: {
    text: "A Mission Pledge is a monthly or yearly commitment to organized compassion. You can choose a cause area, use a private Mission Identity, and let Arukah track verified impact without publicly naming the giver.",
    actions: [
      { label: "View pledge wall", href: "#pledge" },
      { label: "Start my mission", href: "#contact", interest: "Take the Mission Pledge" }
    ]
  },
  need: {
    text: "If you know a genuine need, Arukah can begin with a conversation and then explain the documents, verification steps, and provider details needed for review.",
    actions: [
      { label: "Share a need", href: "#contact", interest: "Submit a need" },
      { label: "See priorities", href: "#priorities" }
    ]
  },
  volunteer: {
    text: "Volunteers can help with field verification, case coordination, professional review, communication, technology, and impact documentation.",
    actions: [
      { label: "Volunteer", href: "#contact", interest: "Volunteer" },
      { label: "Get involved", href: "#involved" }
    ]
  },
  provider: {
    text: "Schools, hospitals, pharmacies, therapy centers, and trusted vendors can partner with Arukah to fulfill verified needs with dignity and clear documentation.",
    actions: [
      { label: "Become a partner", href: "#contact", interest: "Become a provider" },
      { label: "Partnerships", href: "#journal" }
    ]
  },
  missionos: {
    text: "MissionOS is the internal platform for managing cases, pledges, verification, provider fulfillment, private identities, and measurable outcomes.",
    actions: [
      { label: "Open MissionOS", href: missionOsUrl },
      { label: "Learn about MissionOS", href: "#contact", interest: "Learn about MissionOS" }
    ]
  },
  privacy: {
    text: "Arukah protects donor humility and recipient dignity. Public impact can show the mission category and pledge, while private identities and sensitive recipient details stay protected.",
    actions: [
      { label: "Mission pledge", href: "#pledge" },
      { label: "Our approach", href: "#how-it-works" }
    ]
  },
  priorities: {
    text: "Current priority areas include education support, healthcare support, special needs support, livelihood restoration, community support, and emergency care.",
    actions: [
      { label: "See priorities", href: "#priorities" },
      { label: "Contact Arukah", href: "#contact" }
    ]
  },
  contact: {
    text: "You can begin with the contact form. Choose the closest interest, add a short message, and the site will prepare an email to Arukah.",
    actions: [
      { label: "Go to contact", href: "#contact" }
    ]
  },
  fallback: {
    text: "I can help with mission pledges, submitting a need, volunteering, provider partnerships, privacy, priorities, and MissionOS.",
    actions: [
      { label: "Take the pledge", href: "#contact", interest: "Take the Mission Pledge" },
      { label: "Submit a need", href: "#contact", interest: "Submit a need" }
    ]
  }
};

document.querySelectorAll("[data-app-link]").forEach(link => {
  link.href = missionOsUrl;
});

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

function getAssistantTopic(message) {
  const value = message.toLowerCase();

  if (/(pledge|donor|donate|giving|give|mission identity|monthly|yearly)/.test(value)) return "pledge";
  if (/(need|help|beneficiary|case|support|document|verify|verification)/.test(value)) return "need";
  if (/(volunteer|serve|help out|join)/.test(value)) return "volunteer";
  if (/(partner|provider|school|hospital|pharmacy|therapy|vendor|csr|ngo|trust)/.test(value)) return "provider";
  if (/(missionos|mission os|platform|software|login|dashboard|app)/.test(value)) return "missionos";
  if (/(private|privacy|identity|anonymous|dignity|recipient)/.test(value)) return "privacy";
  if (/(priority|education|health|medical|livelihood|emergency|special needs)/.test(value)) return "priorities";
  if (/(contact|email|phone|whatsapp|call|reach)/.test(value)) return "contact";

  return "fallback";
}

function appendAssistantMessage(text, sender = "bot", actions = []) {
  if (!assistantMessages) return;

  const message = document.createElement("div");
  message.className = `assistant-message ${sender}`;
  const copy = document.createElement("span");
  copy.textContent = text;
  message.append(copy);

  if (actions.length) {
    const actionList = document.createElement("div");
    actionList.className = "assistant-actions";

    actions.forEach(action => {
      const element = document.createElement(action.href ? "a" : "button");
      element.textContent = action.label;

      if (action.href) {
        element.href = action.href;
      } else {
        element.type = "button";
      }

      if (action.interest) {
        element.dataset.assistantInterest = action.interest;
      }

      actionList.append(element);
    });

    message.append(actionList);
  }

  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function setContactInterest(interest) {
  if (!interest || !contactForm) return;
  const interestField = contactForm.querySelector("select[name='interest']");

  if (interestField) {
    interestField.value = interest;
  }
}

function respondToAssistant(message) {
  const topic = getAssistantTopic(message);
  const reply = assistantReplies[topic] ?? assistantReplies.fallback;
  appendAssistantMessage(reply.text, "bot", reply.actions);
}

function openAssistant() {
  if (!assistantPanel || !assistantToggle) return;
  assistantPanel.hidden = false;
  assistantToggle.setAttribute("aria-expanded", "true");

  if (!assistantMessages?.childElementCount) {
    appendAssistantMessage(
      "Hi, I am here to help you find the right next step with Arukah Missions.",
      "bot",
      assistantReplies.fallback.actions
    );
  }

  assistantInput?.focus();
}

function closeAssistant() {
  if (!assistantPanel || !assistantToggle) return;
  assistantPanel.hidden = true;
  assistantToggle.setAttribute("aria-expanded", "false");
  assistantToggle.focus();
}

assistantToggle?.addEventListener("click", () => {
  if (assistantPanel?.hidden) {
    openAssistant();
  } else {
    closeAssistant();
  }
});

assistantClose?.addEventListener("click", closeAssistant);

document.querySelectorAll("[data-assistant-topic]").forEach(button => {
  button.addEventListener("click", () => {
    const topic = button.dataset.assistantTopic;
    const reply = assistantReplies[topic] ?? assistantReplies.fallback;
    openAssistant();
    appendAssistantMessage(button.textContent.trim(), "user");
    appendAssistantMessage(reply.text, "bot", reply.actions);
  });
});

assistantMessages?.addEventListener("click", event => {
  const target = event.target.closest("[data-assistant-interest]");

  if (target) {
    setContactInterest(target.dataset.assistantInterest);
  }
});

assistantForm?.addEventListener("submit", event => {
  event.preventDefault();
  const message = assistantInput.value.trim();

  if (!message) return;

  appendAssistantMessage(message, "user");
  assistantInput.value = "";
  respondToAssistant(message);
});
