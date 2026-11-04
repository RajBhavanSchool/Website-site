/* Local canvas globe: no rendering library, tracking, or external globe service. */
(() => {
  const canvas = document.querySelector("#innovation-globe");
  const context = canvas.getContext("2d");
  const section = document.querySelector("#innovation");
  const toggle = document.querySelector("#globe-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let points = [],
    rotation = -1.35,
    visible = false,
    manualPause = false;
  let frame = 0,
    previous = 0,
    drag = null,
    size = 440,
    hue = "190, 240, 137";
  const TAU = Math.PI * 2;
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const connections = [
    [27.5, 77.7],
    [51.5, -0.12],
    [35.7, 139.7],
    [-33.9, 151.2],
    [40.7, -74],
    [1.35, 103.8],
  ];
  function isPaused() {
    return (
      manualPause ||
      reduced.matches ||
      document.documentElement.classList.contains("motion-paused")
    );
  }
  function updateControl() {
    const paused = isPaused();
    toggle.textContent = paused ? "Rotate globe" : "Pause rotation";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute(
      "aria-label",
      paused ? "Start globe rotation" : "Pause globe rotation",
    );
    toggle.disabled =
      reduced.matches ||
      document.documentElement.classList.contains("motion-paused");
    toggle.title = toggle.disabled
      ? "Automatic rotation follows your motion preferences. Use the arrow controls to explore."
      : "";
  }
  function project(lat, lon, radius = 1) {
    const latitude = rad(lat),
      longitude = rad(lon) + rotation;
    const x = Math.cos(latitude) * Math.sin(longitude),
      y = Math.sin(latitude),
      z = Math.cos(latitude) * Math.cos(longitude);
    const tilt = 0.16;
    return {
      x: x * radius,
      y: (y * Math.cos(tilt) - z * Math.sin(tilt)) * radius,
      z: y * Math.sin(tilt) + z * Math.cos(tilt),
    };
  }
  function draw() {
    if (!context) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size, size);
    const cx = size / 2,
      cy = size / 2,
      r = size * 0.355;
    const glow = context.createRadialGradient(
      cx,
      cy,
      r * 0.8,
      cx,
      cy,
      r * 1.38,
    );
    glow.addColorStop(0, `rgba(${hue},.12)`);
    glow.addColorStop(1, `rgba(${hue},0)`);
    context.fillStyle = glow;
    context.fillRect(0, 0, size, size);
    const body = context.createRadialGradient(
      cx - r * 0.3,
      cy - r * 0.4,
      0,
      cx,
      cy,
      r,
    );
    body.addColorStop(0, "#1b493e");
    body.addColorStop(0.75, "#102d28");
    body.addColorStop(1, "#0a211d");
    context.beginPath();
    context.arc(cx, cy, r, 0, TAU);
    context.fillStyle = body;
    context.fill();
    function line(coordinates, color, width = 1) {
      context.beginPath();
      let began = false;
      for (const [lat, lon] of coordinates) {
        const p = project(lat, lon);
        if (p.z < 0) {
          began = false;
          continue;
        }
        const x = cx + p.x * r,
          y = cy - p.y * r;
        if (!began) {
          context.moveTo(x, y);
          began = true;
        } else context.lineTo(x, y);
      }
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const c = [];
      for (let lon = -180; lon <= 180; lon += 3) c.push([lat, lon]);
      line(c, "rgba(148,203,177,.13)");
    }
    for (let lon = -180; lon < 180; lon += 30) {
      const c = [];
      for (let lat = -90; lat <= 90; lat += 3) c.push([lat, lon]);
      line(c, "rgba(148,203,177,.13)");
    }
    points.forEach(([lon, lat]) => {
      const p = project(lat, lon);
      if (p.z <= 0) return;
      context.fillStyle = `rgba(${hue},${0.25 + 0.75 * p.z})`;
      context.beginPath();
      context.arc(
        cx + p.x * r,
        cy - p.y * r,
        Math.max(0.7, size * 0.0033) * (0.6 + p.z * 0.4),
        0,
        TAU,
      );
      context.fill();
    });
    context.beginPath();
    context.ellipse(cx, cy, r * 1.28, r * 0.34, -0.4, 0, TAU);
    context.strokeStyle = `rgba(${hue},.24)`;
    context.lineWidth = 1;
    context.stroke();
    connections.forEach(([lat, lon], index) => {
      const p = project(lat, lon);
      if (p.z < 0.1) return;
      const x = cx + p.x * r,
        y = cy - p.y * r;
      context.beginPath();
      context.arc(x, y, index === 0 ? 4.5 : 3, 0, TAU);
      context.fillStyle = index === 0 ? "#f7dba1" : "#e2ffb2";
      context.shadowColor = "#d5fa77";
      context.shadowBlur = 12;
      context.fill();
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(x, y, index === 0 ? 10 : 7, 0, TAU);
      context.strokeStyle = "#d5fa7760";
      context.stroke();
      if (index === 0) {
        context.fillStyle = "#f7edcf";
        context.font = `500 ${Math.max(9, size * 0.023)}px Inter,Arial`;
        context.fillText("MATHURA", x + 14, y + 4);
      }
    });
    context.beginPath();
    context.arc(cx, cy, r, 0, TAU);
    context.strokeStyle = `rgba(${hue},.28)`;
    context.lineWidth = 1.2;
    context.stroke();
  }
  function resize() {
    size = Math.max(200, canvas.clientWidth);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    draw();
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || isPaused() || drag) {
      previous = 0;
      return;
    }
    rotation += previous ? Math.min(now - previous, 50) * 0.00011 : 0;
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    updateControl();
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    draw();
    if (visible && !document.hidden && !isPaused() && !drag)
      frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener("click", () => {
    manualPause = !manualPause;
    sync();
  });
  document.querySelector("#globe-left").addEventListener("click", () => {
    rotation -= 0.3;
    draw();
  });
  document.querySelector("#globe-right").addEventListener("click", () => {
    rotation += 0.3;
    draw();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, start: rotation, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
    sync();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    rotation = drag.start + (event.clientX - drag.x) * 0.008;
    draw();
  });
  function endDrag() {
    drag = null;
    canvas.classList.remove("dragging");
    sync();
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("lostpointercapture", () => {
    if (drag) endDrag();
  });
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      sync();
    },
    { threshold: 0.08 },
  ).observe(canvas);
  fetch("assets/globe-land.json")
    .then((response) => {
      if (!response.ok) throw new Error("Globe geography unavailable");
      return response.json();
    })
    .then((data) => {
      points = data;
      draw();
    })
    .catch(() => {
      canvas.setAttribute(
        "aria-label",
        "Rotating globe with latitude and longitude lines. Geographic detail is currently unavailable.",
      );
    });
  const topics = {
    robotics: [
      "BUILD. CODE. BRING IT TO LIFE.",
      "From “what if” to “it works.”",
      "Connect creative thinking with coding. Discover how small instructions can set big ideas in motion.",
      "190, 240, 137",
    ],
    ai: [
      "PATTERNS. POSSIBILITIES. PERSPECTIVE.",
      "Teach a machine. Expand your thinking.",
      "Explore how machines recognise patterns—and why human curiosity, judgement, and care still matter.",
      "134, 224, 240",
    ],
    ideas: [
      "LOCAL CURIOSITY. GLOBAL POSSIBILITIES.",
      "Your next idea could go anywhere.",
      "Start with a question about the world around you. Imagine a solution, test it, and see what you learn.",
      "241, 201, 137",
    ],
  };
  document.querySelectorAll("[data-tech]").forEach((button) =>
    button.addEventListener("click", () => {
      const data = topics[button.dataset.tech];
      document
        .querySelectorAll("[data-tech]")
        .forEach((other) =>
          other.setAttribute("aria-pressed", String(other === button)),
        );
      document.querySelector("#tech-label").textContent = data[0];
      document.querySelector("#tech-heading").textContent = data[1];
      document.querySelector("#tech-description").textContent = data[2];
      hue = data[3];
      draw();
    }),
  );
  // External players load only after a deliberate play click; dimensions remain fixed.
  document.querySelectorAll(".video-mount").forEach((mount) => {
    const button = mount.querySelector(".video-launch");
    button.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${mount.dataset.videoId}?autoplay=1&rel=0&playsinline=1`;
      iframe.title = mount.dataset.videoTitle;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      mount.replaceChildren(iframe);
      iframe.focus();
    });
    const img = mount.querySelector("img");
    img.addEventListener("error", () => {
      img.hidden = true;
      mount.classList.add("thumbnail-unavailable");
    });
  });
  resize();
  sync();
})();
