document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const howBtn = document.getElementById("howBtn");
    const title = document.getElementById("titleScreen");

    const modal = document.getElementById("howModal");
    let isStarting = false;

    const startGame = () => {
        if (isStarting) return;
        isStarting = true;

        document.querySelector(".logo")?.classList.add("pause");

        startBtn && (startBtn.disabled = true);
        howBtn && (howBtn.disabled = true);

        if (modal?.classList.contains("is-open")) {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("isModalOpen");
            document.body.style.overflow = "";
        }

        title?.classList.add("is-zooming");

        window.setTimeout(() => {
            window.location.href = "game.html";
        }, 620);
    };

    startBtn?.addEventListener("click", startGame);

    if (howBtn && modal) {
        const openModal = () => {

            if (isStarting) return;

            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("isModalOpen");
            document.body.style.overflow = "hidden";
        };

        const closeModal = () => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("isModalOpen");
            document.body.style.overflow = "";
        };

        howBtn.addEventListener("click", openModal);

        modal.addEventListener("click", (e) => {
            if (e.target.matches("[data-close]")) closeModal();
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
        });
    }
});
