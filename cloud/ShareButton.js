import { useState } from "react";

// Copies the page's link so other people can open (and edit) the same game.
export default function ShareButton() {
  const [state, setState] = useState("idle"); // idle | copied | manual
  const link = window.location.href;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("manual"); // clipboard blocked: show the link to copy by hand
    }
  }

  return (
    <div className="share">
      <button type="button" className="tab-btn share-btn" onClick={copy}>
        {state === "copied" ? "Link copied!" : "Share link"}
      </button>
      {state === "manual" && (
        <input
          className="share-link"
          readOnly
          aria-label="Link to share"
          value={link}
          onFocus={(e) => e.target.select()}
          autoFocus
        />
      )}
    </div>
  );
}
