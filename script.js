/* Progressive enhancement: the page and contact details remain readable without JS. */
const $ = (selector) => document.querySelector(selector);
const scene = $("#scene");

// Opening gates are optional; no content is blocked by the animation.
$("#enter").hidden = false;
$("#replay").hidden = false;
$("#enter").addEventListener("click", () => {
  scene.classList.add("opened");
  $("#enter").textContent = "Welcome to Rajbhavan ✓";
  $(".scene-label").textContent = "A WORLD OF POSSIBILITY AWAITS";
});
$("#replay").addEventListener("click", () => {
  scene.classList.remove("opened");
  $("#enter").textContent = "Open the gates ↗";
  $("#home").scrollIntoView();
  $("#enter").focus({ preventScroll: true });
});

// Native disclosure navigation: Tab follows links; Escape closes and restores focus.
const menu = $(".menu");
const nav = $("#main-nav");
const disclosure = $(".nav-disclosure");
menu.hidden = false;
document.documentElement.classList.add("js");
function closeNavigation(restoreFocus = false) {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
  disclosure.open = false;
  if (restoreFocus) menu.focus();
}
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    closeNavigation();
    const target = document.querySelector(link.hash);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (disclosure.open) {
    disclosure.open = false;
    disclosure.querySelector("summary").focus();
  } else if (nav.classList.contains("open")) closeNavigation(true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("header")) closeNavigation();
});
nav.addEventListener("focusout", () => {
  setTimeout(() => {
    if (!nav.contains(document.activeElement)) disclosure.open = false;
  }, 0);
});

// Native dialogs provide focus containment and standard Escape-to-close behavior.
const stops = [
  [
    "◈",
    "Sports",
    "Movement, teamwork, and the joy of playing together. Sports encourage children to build coordination, practise perseverance, and support one another on and off the playing field.",
  ],
  [
    "✴",
    "Arts & crafts",
    "From drawing and colour to hands-on craft, creative activities give children room to experiment with materials, express their ideas, and take pride in something they have made.",
  ],
  [
    "♪",
    "Dance",
    "Discover rhythm, movement, and self-expression. Dance invites children to develop coordination, explore creativity, and grow in confidence through practice and performance.",
  ],
  [
    "“ ”",
    "Theatre",
    "Bring stories and characters to life through drama, role play, and performance. Theatre helps children practise communication, listen to others, and discover the confidence to take the stage.",
  ],
  [
    "⚙",
    "Robotics lab",
    "Explore how ideas become working systems. Robotics brings together creative design, coding, and problem-solving, encouraging learners to build, test, improve, and collaborate.",
  ],
  [
    "✦",
    "AI lab",
    "Get curious about artificial intelligence, patterns, and the way technology learns from information. Explore creative applications while asking thoughtful questions about accuracy, fairness, privacy, and responsible use.",
  ],
];
let stop = 0;
function renderTour() {
  const [icon, title, copy] = stops[stop];
  $("#tour-icon").textContent = icon;
  $("#tour-title").textContent = title;
  $("#tour-copy").textContent = copy;
  $("#tour-count").textContent = `${stop + 1} / ${stops.length}`;
}
function openTour(index) {
  stop = index;
  renderTour();
  $("#tour-dialog").showModal();
}
$("#tour").addEventListener("click", () => openTour(0));
document.querySelectorAll("[data-tour]").forEach((button) => {
  button.addEventListener("click", () => openTour(Number(button.dataset.tour)));
});
$("#prev").addEventListener("click", () => {
  stop = (stop + stops.length - 1) % stops.length;
  renderTour();
});
$("#next").addEventListener("click", () => {
  stop = (stop + 1) % stops.length;
  renderTour();
});
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector(".close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
});
$("#visit-button").hidden = false;
$("#visit-button").addEventListener("click", () =>
  $("#visit-dialog").showModal(),
);
let downloadUrl;
$("#visit-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#parent").value.trim();
  if (!name) {
    $("#parent").setCustomValidity("Please enter your name.");
    $("#parent").reportValidity();
    return;
  }
  const stage = $("#interest").value;
  const items = [
    "Ask about available places and grade eligibility.",
    "Discuss your child’s interests and learning needs.",
    "Ask about school timings, transport, and fees.",
    "Explore safeguarding and student support.",
    "Confirm the admissions process and required documents.",
    "Email info@rajbhawanschool.com to arrange your visit.",
  ];
  const result = $("#checklist");
  const title = document.createElement("h3");
  title.textContent = `Your visit checklist, ${name}`;
  const list = document.createElement("ul");
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(
    new Blob(
      [
        `Rajbhavan International School\nVisit checklist for ${name}\nInterest: ${stage}\n\n${items.join("\n")}\n\nThis checklist is not an appointment confirmation.`,
      ],
      { type: "text/plain" },
    ),
  );
  const download = document.createElement("a");
  download.href = downloadUrl;
  download.download = "rajbhavan-visit-checklist.txt";
  download.textContent = "Download your checklist ↓";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "text-link";
  edit.textContent = "Edit my details";
  edit.addEventListener("click", () => {
    result.hidden = true;
    $("#visit-form").hidden = false;
    $("#parent").focus();
  });
  result.replaceChildren(
    title,
    list,
    download,
    document.createElement("br"),
    edit,
  );
  result.hidden = false;
  $("#visit-form").hidden = true;
  title.tabIndex = -1;
  title.focus();
});
$("#parent").addEventListener("input", () =>
  $("#parent").setCustomValidity(""),
);

// Static contact form: build an encoded mailto URL; never report a successful send.
const contactForm = $("#contact-form");
$("#contact-submit").hidden = false;
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  for (const input of [$("#contact-name"), $("#contact-message")]) {
    if (!input.value.trim()) {
      input.setCustomValidity("Please enter a value, not just spaces.");
      input.reportValidity();
      return;
    }
  }
  if (!contactForm.reportValidity()) return;
  const name = $("#contact-name").value.trim();
  const email = $("#contact-email").value.trim();
  const grade = $("#contact-grade").value || "General enquiry";
  const message = $("#contact-message").value.trim();
  const body = `Name: ${name}\nReply email: ${email}\nInterest: ${grade}\n\n${message}`;
  const mailto = `mailto:info@rajbhawanschool.com?subject=${encodeURIComponent("School enquiry — " + grade)}&body=${encodeURIComponent(body)}`;
  $("#contact-status").textContent =
    "Your email draft is ready. If your mail app opens, review it and press Send. If it does not open, use the email address below. Nothing has been sent by this website.";
  window.location.href = mailto;
});
contactForm.querySelectorAll("input, textarea").forEach((input) => {
  input.addEventListener("input", () => input.setCustomValidity(""));
});
$("#year").textContent = new Date().getFullYear();

// Motion is decorative, finite, and can be disabled independently of OS settings.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionButton = document.createElement("button");
motionButton.className = "motion-toggle";
motionButton.type = "button";
$(".hero-footer").append(motionButton);
let pausedMotion = motionPreference.matches;
const runningAnimations = new Set();
function updateMotion() {
  document.documentElement.classList.toggle("motion-paused", pausedMotion);
  motionButton.textContent = pausedMotion
    ? "Enable animations"
    : "Pause animations";
  motionButton.setAttribute("aria-pressed", String(pausedMotion));
  if (pausedMotion) {
    runningAnimations.forEach((animation) => animation.finish());
    runningAnimations.clear();
  }
}
motionButton.addEventListener("click", () => {
  pausedMotion = !pausedMotion;
  updateMotion();
});
motionPreference.addEventListener("change", (event) => {
  pausedMotion = event.matches;
  updateMotion();
});
updateMotion();
function animateElement(element, keyframes, options) {
  if (pausedMotion || motionPreference.matches || !element.animate) return;
  const animation = element.animate(keyframes, options);
  runningAnimations.add(animation);
  animation.onfinish = () => runningAnimations.delete(animation);
}
// Content stays visible without JavaScript or observers; only entering elements animate.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateElement(
          entry.target,
          [
            { opacity: 0, transform: "translateY(26px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(
      ".section-heading,.news-card,.calendar-empty,.intro>div,.learning-panel,.life-card,.contact>div,.contact-form,.stats-grid",
    )
    .forEach((element) => revealObserver.observe(element));
}
// A single rAF update keeps the reading-progress indicator inexpensive while scrolling.
let progressFrame = false;
function paintProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  $(".reading-progress").style.transform =
    `scaleX(${available > 0 ? Math.min(1, window.scrollY / available) : 0})`;
  progressFrame = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!progressFrame) {
      progressFrame = true;
      requestAnimationFrame(paintProgress);
    }
  },
  { passive: true },
);
window.addEventListener("resize", paintProgress);
paintProgress();
