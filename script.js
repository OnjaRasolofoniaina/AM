/* ===================================================================
   ANJARA MASOANDRO — script
   - Points de navigation synchronisés avec le scroll
   - Musique YouTube injectée dès la page 3, en boucle
   - Bouton son (mute / unmute) via l'API postMessage de YouTube
=================================================================== */

(function () {
  "use strict";

  const YOUTUBE_VIDEO_ID = "WHbj0BGMeCA";
  const SOUND_START_PAGE = 3; // data-page à partir duquel le son démarre

  const book = document.getElementById("book");
  const pages = Array.from(document.querySelectorAll(".page"));
  const dotsNav = document.getElementById("pageDots");
  const soundToggle = document.getElementById("soundToggle");
  const audioHost = document.getElementById("audioHost");

  let audioStarted = false;
  let isMuted = true;
  let ytIframe = null;

  /* ---------- Points de pagination ---------- */
  function buildDots() {
    pages.forEach((page, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Pejy " + (i + 1));
      dot.addEventListener("click", () => {
        page.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      dotsNav.appendChild(dot);
    });
  }

  function updateDots(activeIndex) {
    Array.from(dotsNav.children).forEach((dot, i) => {
      dot.setAttribute("aria-current", i === activeIndex ? "true" : "false");
    });
  }

  /* ---------- Audio YouTube (dès la page 3), en boucle ---------- */
  function startAudio() {
    if (audioStarted) return;
    audioStarted = true;

    ytIframe = document.createElement("iframe");
    ytIframe.width = "1";
    ytIframe.height = "1";
    ytIframe.setAttribute("allow", "autoplay; encrypted-media");
    ytIframe.setAttribute("frameborder", "0");
    ytIframe.src =
      "https://www.youtube.com/embed/" + YOUTUBE_VIDEO_ID +
      "?autoplay=1&mute=1&loop=1&playlist=" + YOUTUBE_VIDEO_ID +
      "&controls=0&enablejsapi=1";

    audioHost.appendChild(ytIframe);

    soundToggle.hidden = false;
    requestAnimationFrame(() => soundToggle.classList.add("is-visible"));
  }

  function ytCommand(func) {
    if (!ytIframe || !ytIframe.contentWindow) return;
    ytIframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: func, args: [] }),
      "*"
    );
  }

  soundToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    ytCommand(isMuted ? "mute" : "unMute");
    soundToggle.setAttribute("aria-pressed", String(!isMuted));
    soundToggle.querySelector(".sound-icon").textContent = isMuted ? "🔈" : "🔊";
    soundToggle.querySelector(".sound-label").textContent = isMuted ? "Feo" : "Mikorana";
  });

  /* ---------- Observer : page active + déclenchement audio ---------- */
  function initObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = pages.indexOf(entry.target);
          updateDots(index);

          const pageNumber = parseInt(entry.target.dataset.page, 10);
          if (pageNumber >= SOUND_START_PAGE) {
            startAudio();
          }
        });
      },
      { root: book, threshold: 0.6 }
    );

    pages.forEach((page) => observer.observe(page));
  }

  buildDots();
  updateDots(0);
  initObserver();
})();
