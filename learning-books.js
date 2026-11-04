/* One school storybook. Animated text stays inside a fixed frame on each spread. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const pages = [
    {
      title: "Every great story starts with curiosity.",
      category: "01 · WELCOME",
      intro:
        "Welcome to Rajbhavan International School. This little book is an invitation to imagine what your child can become.",
      points: [
        "A question can open a whole new world.",
        "A little encouragement helps confidence grow.",
        "Every child brings a story worth discovering.",
      ],
    },
    {
      title: "A place to belong. A space to grow.",
      category: "02 · OUR SCHOOL",
      intro:
        "Find us in Tech Man City, Mathura. Our school offers the CBSE curriculum from primary through Grade 7.",
      points: [
        "Rooted in our Mathura community.",
        "Learning from primary through Grade 7.",
        "A journey shaped by curiosity and connection.",
      ],
    },
    {
      title: "Learning begins with “why?”",
      category: "03 · CURIOUS MINDS",
      intro:
        "Our learning vision makes room for questions, exploration, and the pleasure of discovering something new.",
      points: [
        "Read a story. Imagine another world.",
        "Look for patterns. Try a new approach.",
        "Observe, investigate, and ask what happens next.",
      ],
    },
    {
      title: "More than an answer on a page.",
      category: "04 · ROOM TO CREATE",
      intro:
        "Imagine school days filled with expression, collaboration, and ideas that take shape through practice.",
      points: [
        "Tell a story in your own words.",
        "Make something that has never existed before.",
        "Listen to a different point of view.",
      ],
    },
    {
      title: "Small steps. Growing confidence.",
      category: "05 · GROWING TOGETHER",
      intro:
        "Every new challenge is an opportunity to practise, reflect, and try again. These are the values behind our proposed learning vision.",
      points: [
        "Be curious enough to ask.",
        "Be kind enough to listen.",
        "Be brave enough to begin again.",
      ],
    },
    {
      title: "Your next chapter starts with hello.",
      category: "06 · LET’S CONNECT",
      intro:
        "Come with your questions. Contact our school team to learn about admissions or arrange a visit.",
      points: [
        "Tech Man City, Mathura.",
        "Primary through Grade 7 · CBSE curriculum.",
        "Email info@rajbhawanschool.com.",
      ],
    },
  ];
  let current = 0,
    lessonPlayer = null,
    turning = false,
    turnAnimation = null;
  function stopMedia() {
    lessonPlayer?.destroy();
    lessonPlayer = null;
  }
  function createTextLesson(host, book, page) {
    const player = document.createElement("div");
    player.className = "text-lesson-player";
    player.innerHTML = `<div class="text-film" role="group" aria-label="Animated text lesson"><div class="film-top"><span>RAJBHAVAN STUDIO</span><span class="film-grade"></span></div><div class="film-orbit" aria-hidden="true"></div><div class="film-content" aria-hidden="true"><span class="film-symbol">✦</span><span class="film-kicker"></span><strong class="film-text"></strong><span class="film-step"></span></div><div class="film-bottom"><span>LEARN. WONDER. GROW.</span><span>TEXT LESSON · NO AUDIO</span></div></div><div class="film-controls"><button type="button" class="film-play">Pause</button><button type="button" class="film-replay" aria-label="Replay animated lesson">↺</button><progress class="film-progress" max="16000" value="0" aria-label="Lesson progress"></progress><span class="film-time">0:00 / 0:16</span></div>`;
    host.append(player);
    const find = (selector) => player.querySelector(selector);
    find(".film-grade").textContent = "OUR STORY";
    const slides = [page.title, ...page.points];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0,
      playing = false,
      frame = 0,
      previous = 0,
      slide = -1,
      textAnimation;
    function motionOff() {
      return (
        reduced.matches ||
        document.documentElement.classList.contains("motion-paused")
      );
    }
    function paint() {
      const index = Math.min(3, Math.floor(elapsed / 4000));
      if (slide !== index) {
        slide = index;
        find(".film-kicker").textContent =
          index === 0 ? "LET’S DISCOVER" : `IDEA ${index} OF 3`;
        find(".film-text").textContent = slides[index];
        find(".film-step").textContent = [
          "✦  A new idea starts here",
          "01  Get curious",
          "02  Make a connection",
          "03  Give it a try",
        ][index];
        find(".text-film").dataset.slide = index;
        textAnimation?.cancel();
        if (!motionOff())
          textAnimation = find(".film-content").animate(
            [
              { opacity: 0, transform: "translateY(18px) scale(.96)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
      }
      find(".film-progress").value = elapsed;
      find(".film-time").textContent =
        `0:${String(Math.floor(elapsed / 1000)).padStart(2, "0")} / 0:16`;
    }
    function tick(now) {
      if (!playing) return;
      elapsed = Math.min(16000, elapsed + (previous ? now - previous : 0));
      previous = now;
      paint();
      if (elapsed >= 16000) {
        pause();
        find(".film-play").textContent = "Play again";
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    function pause() {
      playing = false;
      previous = 0;
      cancelAnimationFrame(frame);
      find(".film-play").textContent = "Play";
      player.classList.remove("playing");
      textAnimation?.pause();
    }
    function play() {
      if (elapsed >= 16000) {
        elapsed = 0;
        slide = -1;
      }
      playing = true;
      previous = 0;
      find(".film-play").textContent = "Pause";
      player.classList.add("playing");
      textAnimation?.play();
      frame = requestAnimationFrame(tick);
    }
    find(".film-play").addEventListener("click", () =>
      playing ? pause() : play(),
    );
    find(".film-replay").addEventListener("click", () => {
      pause();
      elapsed = 0;
      slide = -1;
      paint();
      play();
    });
    const observer = new MutationObserver(() => {
      if (motionOff()) pause();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const onPreference = () => {
      if (reduced.matches) pause();
    };
    reduced.addEventListener("change", onPreference);
    paint();
    if (!motionOff()) play();
    else pause();
    return {
      pause,
      destroy() {
        pause();
        textAnimation?.cancel();
        observer.disconnect();
        reduced.removeEventListener("change", onPreference);
      },
    };
  }

  function renderPage() {
    stopMedia();
    const page = pages[current];
    $("#page-category").textContent = page.category;
    $("#page-title").textContent = page.title;
    $("#page-intro").textContent = page.intro;
    $("#page-points").replaceChildren(
      ...page.points.map((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        return item;
      }),
    );
    $("#page-media").replaceChildren();
    lessonPlayer = createTextLesson($("#page-media"), {}, page);
    $("#video-caption").textContent =
      "A moving illustration of our story · No audio";
    $("#page-count").textContent =
      `${current * 2 + 1} — ${current * 2 + 2} / ${pages.length * 2}`;
    $("#page-select").value = current;
    $("#previous-page").disabled = current === 0;
    $("#next-page").disabled = current === pages.length - 1;
  }
  function changePage(next) {
    if (turning || next < 0 || next >= pages.length || next === current) return;
    const backwards = next < current;
    const reduced =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("motion-paused");
    let leaf;
    if (!reduced) {
      leaf = document.createElement("div");
      leaf.className =
        "turning-leaf " + (backwards ? "leaf-back" : "leaf-forward");
      leaf.setAttribute("aria-hidden", "true");
      leaf.inert = true;
      const old = $(backwards ? ".page-copy" : ".page-video").cloneNode(true);
      old.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      old.removeAttribute("id");
      leaf.append(old);
      $("#book-spread").append(leaf);
    }
    current = next;
    renderPage();
    if (leaf) {
      turning = true;
      turnAnimation = leaf.animate(
        [
          { transform: "rotateY(0deg)", filter: "brightness(1)" },
          {
            transform: `rotateY(${backwards ? 90 : -90}deg)`,
            filter: "brightness(.75)",
            offset: 0.65,
          },
          {
            transform: `rotateY(${backwards ? 180 : -180}deg)`,
            filter: "brightness(.9)",
          },
        ],
        // Let readers follow the sheet across the spine before it settles.
        { duration: 2200, easing: "cubic-bezier(.45,0,.35,1)", fill: "forwards" },
      );
      const finish = () => {
        leaf.remove();
        turning = false;
        turnAnimation = null;
      };
      turnAnimation.onfinish = finish;
      turnAnimation.oncancel = finish;
    }
    $("#page-title").focus({ preventScroll: true });
  }
  $("#page-select").replaceChildren(
    ...pages.map((page, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = page.category;
      return option;
    }),
  );
  $("#open-book").addEventListener("click", () => {
    $("#single-book-shelf").hidden = true;
    $("#book-reader").hidden = false;
    $("#open-book").setAttribute("aria-expanded", "true");
    renderPage();
    if (
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.documentElement.classList.contains("motion-paused")
    )
      $("#book-reader").animate(
        [
          {
            opacity: 0,
            transform: "perspective(1400px) rotateY(-12deg) scale(.93)",
          },
          {
            opacity: 1,
            transform: "perspective(1400px) rotateY(0deg) scale(1)",
          },
        ],
        { duration: 650, easing: "ease-out" },
      );
    $("#book-reader").scrollIntoView({ block: "start" });
    $("#page-title").focus({ preventScroll: true });
  });
  $("#close-book").addEventListener("click", () => {
    turnAnimation?.cancel();
    stopMedia();
    $("#book-reader").hidden = true;
    $("#single-book-shelf").hidden = false;
    $("#open-book").setAttribute("aria-expanded", "false");
    $("#open-book").focus();
  });
  $("#previous-page").addEventListener("click", () => changePage(current - 1));
  $("#next-page").addEventListener("click", () => changePage(current + 1));
  $("#page-select").addEventListener("change", (event) => {
    if (turning) {
      event.target.value = current;
      return;
    }
    changePage(Number(event.target.value));
  });
  $("#book-spread").addEventListener("keydown", (event) => {
    if (event.target.closest("button,select,input,video")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changePage(current + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changePage(current - 1);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) lessonPlayer?.pause();
  });
})();
