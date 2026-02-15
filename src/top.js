document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const howBtn = document.getElementById("howBtn");
  const title = document.getElementById("titleScreen");
  const modal = document.getElementById("howModal");

  let isStarting = false;

  const openModal = () => {
    if (isStarting) return;
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("isModalOpen");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("isModalOpen");
    document.body.style.overflow = "";
  };

  howBtn?.addEventListener("click", openModal);

  modal?.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  const startGame = () => {
    if (isStarting) return;
    isStarting = true;

    document.querySelector(".logo")?.classList.add("pause");

    startBtn && (startBtn.disabled = true);
    howBtn && (howBtn.disabled = true);

    if (modal?.classList.contains("is-open")) closeModal();

    title?.classList.add("is-zooming");

    window.setTimeout(() => {
      title?.classList.add("is-leaving");
    }, 180);

    window.setTimeout(() => {
      window.location.href = "game.html";
    }, 760);
  };

  startBtn?.addEventListener("click", startGame);
});
