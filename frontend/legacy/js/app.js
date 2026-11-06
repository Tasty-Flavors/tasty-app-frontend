(() => {
  const app = document.getElementById("app");
  if (!app) return;

  const note = document.createElement("p");
  note.textContent = "JS loaded.";
  app.appendChild(note);
})();
