import { gsap } from "gsap";
import { getHTMLElement, getHTMLElements } from "@/lib/utils";

// GSAP mouse movement animation
document.addEventListener("DOMContentLoaded", (): void => {
  const emojis = getHTMLElements(
    ".emoji.wave, .emoji.smug, .emoji.cool, .emoji.heart, .emoji"
  );
  const container = getHTMLElement(".hero-image-background");

  if (!container || emojis.length === 0) {
    return;
  }

  document.addEventListener("mousemove", (e: MouseEvent): void => {
    // Get mouse position relative to the container
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    emojis.forEach((emoji: HTMLElement): void => {
      const rect = emoji.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - containerRect.left;
      const centerY = rect.top + rect.height / 2 - containerRect.top;

      // Calculate the distance between mouse and emoji
      const distanceX = mouseX - centerX;
      const distanceY = mouseY - centerY;

      // Move the emoji 1% of the distance
      gsap.to(emoji, {
        x: distanceX * 0.01,
        y: distanceY * 0.01,
        duration: 1,
        ease: "sine.out",
      });
    });
  });
});

// Line clamp functionality
function clampText(element: HTMLElement, maxLines: number): void {
  const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
  const maxHeight = lineHeight * maxLines;

  let content = element.getAttribute("data-original-text");
  if (!content) {
    content = element.textContent || "";
    element.setAttribute("data-original-text", content);
  }

  element.textContent = content;
  while (element.scrollHeight > maxHeight) {
    content = content.slice(0, -1);
    element.textContent = content + "...";
  }
}

function applyClampToElements(): void {
  const containers = getHTMLElements(".clamp-text");
  containers.forEach((container) => clampText(container, 4));
}

export { applyClampToElements };
