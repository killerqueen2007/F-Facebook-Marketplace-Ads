const normalize = text =>
  (text || "").replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "").trim();

const isAdLabel = el => {
  const text = normalize(el.textContent);
  return /^(Sponsored|Ad)$/i.test(text);
};

const getAdCard = label => {
  let current = label;
  let best = null;

  for (let i = 0; i < 15 && current.parentElement; i++) {
    current = current.parentElement;

    if (current === document.body || current === document.documentElement) {
      break;
    }

    const text = normalize(current.innerText);
    const images = current.querySelectorAll("img").length;
    const links = current.querySelectorAll("a").length;

    // Avoid climbing into a large feed container.
    if (links > 30 || text.length > 5000) break;

    // Keep the closest ancestor that includes the ad's image content.
    if (images > 0 && links >= 2) {
      best = current;
    }

    // Facebook's supplied ad carousel wrapper.
    if (current.classList.contains("g381_242")) {
      return current;
    }

    // Stop at a plausible, self-contained card.
    if (best && (links >= 2 || images >= 2) && i >= 3) {
      return best;
    }
  }

  return best;
};

const clean = () => {
  const labels = [
    ...document.querySelectorAll('[dir="auto"], .xt0psk2')
  ].filter(isAdLabel);

  const cardsToRemove = new Set();

  for (const label of labels) {
    const card = getAdCard(label);
    if (card) cardsToRemove.add(card);
  }

  // Find image links marked as paid Facebook ads.
  // Prefer removing a containing ad card when we can identify one safely.
  const paidImageLinks = document.querySelectorAll(
    'a[href*="utm_medium=paid"][href*="utm_source=fb"]'
  );

  for (const link of paidImageLinks) {
    if (!link.querySelector("img")) continue;

    const labelledAd = link.closest(".g381_242");
    if (labelledAd) {
      cardsToRemove.add(labelledAd);
      continue;
    }

    // Only remove the individual image link if no labelled card was found.
    cardsToRemove.add(link);
  }

  // Remove outermost matches first so child removals don't leave remnants.
  const cards = [...cardsToRemove].filter(card =>
    ![...cardsToRemove].some(other =>
      other !== card && other.contains(card)
    )
  );

  for (const card of cards) {
    if (
      card.isConnected &&
      card !== document.body &&
      card !== document.documentElement
    ) {
      card.remove();
    }
  }
};

let scheduled = false;

const observer = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;
    clean();
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

clean();
