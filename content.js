const clean = () => {
  document.querySelectorAll(".xt0psk2").forEach(el => {
    if (el.textContent.includes("Sponsored")) {
      el.closest(".g381_242")?.remove();
    }
  });

  document.querySelectorAll(".g381_242").forEach(el => {
    if (!el.innerText.trim() && !el.querySelector("img,video")) {
      el.remove();
    }
  });
};

new MutationObserver(clean).observe(document.body, {
  childList: true,
  subtree: true
});

clean();