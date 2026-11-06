const $ = (selector) => document.querySelector(selector);

// Brand introduction: visible on entry, skippable, and absent for reduced motion.
const intro = $("#brand-intro");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let introTimer;
function closeIntro() {
  clearTimeout(introTimer);
  intro.classList.add("hide");
  document.body.classList.remove("intro-active");
  setTimeout(() => intro.remove(), reduceMotion.matches ? 0 : 800);
}
if (reduceMotion.matches) intro.remove();
else {
  document.body.classList.add("intro-active");
  $("#skip-intro").addEventListener("click", closeIntro);
  introTimer = setTimeout(closeIntro, 4800);
}

// Mobile navigation.
const menu = $(".menu-button");
const nav = $("#nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }),
);
const desktopNavigation = matchMedia("(min-width: 901px)");
desktopNavigation.addEventListener("change", (event) => {
  if (!event.matches) return;
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
});
document.addEventListener("pointerdown", (event) => {
  if (!nav.classList.contains("open")) return;
  if (nav.contains(event.target) || menu.contains(event.target)) return;
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});

// Academic stage tabs support pointer and arrow-key navigation.
const stages = [
  {
    word: "Wonder",
    image: "assets/academics/primary-learning-badged.jpg",
    imageAlt:
      "Primary children learning together through blocks, number cards and books",
    kicker: "Build a joyful foundation",
    title: "Small discoveries.\nBig beginnings.",
    description:
      "Play, stories, number sense and shared discovery help young learners build confidence and a lasting appetite for learning.",
    items: [
      "Learning through play and exploration",
      "Stories, language and expression",
      "Number sense and creative discovery",
    ],
  },
  {
    word: "Question",
    image: "assets/academics/grades-4-5-maths-badged.jpg",
    imageAlt:
      "Grades 4 and 5 children solving mathematics together and asking questions",
    kicker: "Reason, solve and ask why",
    title: "Mathematics becomes\na conversation.",
    description:
      "Children solve age-appropriate problems, compare methods, explain their reasoning and grow confident enough to ask thoughtful questions.",
    items: [
      "Fractions and multiplication",
      "Geometry and measurement",
      "Questioning and explaining solutions",
    ],
  },
  {
    word: "Explore",
    image: "assets/academics/grades-6-7-ai-badged.jpg",
    imageAlt:
      "Grades 6 and 7 children using critical thinking while exploring artificial intelligence",
    kicker: "Think critically. Explore responsibly.",
    title: "Ideas, evidence\nand intelligent tools.",
    description:
      "Learners test ideas, examine evidence and explore how AI recognises patterns—while discussing responsible, thoughtful use of technology.",
    items: [
      "Critical thinking and evidence",
      "Patterns, data and AI foundations",
      "Responsible technology exploration",
    ],
  },
];
const tabs = [...document.querySelectorAll("[data-stage]")];
function selectStage(index) {
  tabs.forEach((tab, position) => {
    tab.setAttribute("aria-selected", String(position === index));
    tab.tabIndex = position === index ? 0 : -1;
  });
  const stage = stages[index];
  const stageImage = $("#stage-image");
  $("#stage-panel").setAttribute("aria-labelledby", `tab-${index}`);
  stageImage.src = stage.image;
  stageImage.alt = stage.imageAlt;
  stageImage.classList.remove("switching");
  void stageImage.offsetWidth;
  stageImage.classList.add("switching");
  $("#stage-index").textContent = String(index + 1).padStart(2, "0");
  $("#stage-word").textContent = stage.word;
  $("#stage-kicker").textContent = stage.kicker;
  $("#stage-title").innerText = stage.title;
  $("#stage-description").textContent = stage.description;
  $("#stage-list").replaceChildren(
    ...stage.items.map((text) =>
      Object.assign(document.createElement("li"), { textContent: text }),
    ),
  );
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStage(index));
  tab.addEventListener("keydown", (event) => {
    const map = {
      ArrowRight: (index + 1) % 3,
      ArrowLeft: (index + 2) % 3,
      Home: 0,
      End: 2,
    };
    if (!(event.key in map)) return;
    event.preventDefault();
    selectStage(map[event.key]);
    tabs[map[event.key]].focus();
  });
});

// Slow, visible page turns for the single school storybook.
const chapters = [
  [
    "01 · Welcome",
    "Every great story starts with curiosity.",
    "A question can open a whole new world. A little encouragement helps confidence grow, and every child brings a story worth discovering.",
    "Curiosity",
  ],
  [
    "02 · Our school",
    "A place to belong. A space to grow.",
    "In Tech Man City, Mathura, Raj Bhawan offers a CBSE learning journey from Primary to Grade 7.",
    "Belonging",
  ],
  [
    "03 · Learning",
    "More than an answer on a page.",
    "Read, observe, make, move and try again. Learning becomes memorable when children connect knowledge with experience.",
    "Discovery",
  ],
  [
    "04 · Your journey",
    "The next chapter starts with hello.",
    "Come with your questions. Contact the school team to learn about admissions and plan your first conversation.",
    "Begin",
  ],
];
let chapter = 0;
let turning = false;
function renderChapter() {
  const [kicker, title, copy, word] = chapters[chapter];
  $("#book-kicker").textContent = kicker;
  $("#book-title").textContent = title;
  $("#book-copy").textContent = copy;
  $("#book-film-word").textContent = word;
  $("#book-count").textContent = `Chapter ${chapter + 1} of ${chapters.length}`;
  $("#book-prev").disabled = chapter === 0;
  $("#book-next").disabled = chapter === chapters.length - 1;
  $(".book-dots").replaceChildren(
    ...chapters.map((_, index) => {
      const dot = document.createElement("i");
      if (index === chapter) dot.className = "active";
      return dot;
    }),
  );
}
function turnPage(delta) {
  const next = chapter + delta;
  if (turning || next < 0 || next >= chapters.length) return;
  if (reduceMotion.matches) {
    chapter = next;
    renderChapter();
    return;
  }
  turning = true;
  const leaf = $(".turning-page");
  leaf.classList.toggle("back", delta < 0);
  leaf.classList.add("turn");
  setTimeout(() => {
    chapter = next;
    renderChapter();
  }, 920);
  setTimeout(() => {
    leaf.classList.remove("turn", "back");
    turning = false;
  }, 1850);
}
$("#open-book").addEventListener("click", () => {
  $("#open-book").hidden = true;
  $("#open-book").setAttribute("aria-expanded", "true");
  $("#book-reader").hidden = false;
  renderChapter();
  $("#book-title").focus();
});
$("#close-book").addEventListener("click", () => {
  $("#book-reader").hidden = true;
  $("#open-book").hidden = false;
  $("#open-book").setAttribute("aria-expanded", "false");
  $("#open-book").focus();
});
$("#book-prev").addEventListener("click", () => turnPage(-1));
$("#book-next").addEventListener("click", () => turnPage(1));

// Contact and visit checklist.
const dialog = $("#checklist-dialog");
$("#checklist-button").addEventListener("click", () => dialog.showModal());
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
$("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const grade = $("#grade").value;
  const message = $("#message").value.trim();
  const body = `Name: ${name}\nReply email: ${email}\nGrade of interest: ${grade}\n\n${message}`;
  $("#form-status").textContent =
    "Your email draft is ready. Review it in your mail app and press Send.";
  location.href = `mailto:info@rajbhawanschool.com?subject=${encodeURIComponent(`School enquiry — ${grade}`)}&body=${encodeURIComponent(body)}`;
});

// Reading progress and entrance reveals.
let scrollFrame = 0;
function paintProgress() {
  const available = document.documentElement.scrollHeight - innerHeight;
  $(".progress span").style.transform =
    `scaleX(${available > 0 ? scrollY / available : 0})`;
  scrollFrame = 0;
}
addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(paintProgress);
  },
  { passive: true },
);
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(25px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        observer.unobserve(entry.target);
      }),
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(
      ".section-head,.intro-grid,.story-copy,.life-grid article,.admission-steps article,.contact form",
    )
    .forEach((element) => observer.observe(element));
}
$("#year").textContent = new Date().getFullYear();
