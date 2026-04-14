document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      if (!target) return;

      tabs.forEach((item) => item.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      tab.classList.add("active");

      const nextPanel = document.getElementById(target);
      if (nextPanel) {
        nextPanel.classList.add("active");
      }
    });
  });

  const evidenceItems = document.querySelectorAll(".evidence-item");
  const evidencePanels = document.querySelectorAll(".evidence-panel");

  evidenceItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.evidence;
      if (!target) return;

      evidenceItems.forEach((button) => button.classList.remove("active"));
      evidencePanels.forEach((panel) => panel.classList.remove("active"));

      item.classList.add("active");

      const nextPanel = document.getElementById(`evidence-${target}`);
      if (nextPanel) {
        nextPanel.classList.add("active");
      }
    });
  });
});