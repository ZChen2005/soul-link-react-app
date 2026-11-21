import { useEffect, useState } from "react";

// A text box that suggests names as you type (like the Pokemon name box).
// `find(text)` returns the exact option name for what was typed, or "" if there is none.
export default function SuggestInput({
  value,
  options,
  listId,
  find,
  onCommit,
  placeholder,
  ariaLabel,
  className = "",
}) {
  const [text, setText] = useState(value || "");
  const [invalid, setInvalid] = useState(false);

  // Follow the saved value if it changes somewhere else (another player, a shared edit).
  useEffect(() => {
    setText(value || "");
  }, [value]);

  function handleChange(e) {
    const next = e.target.value;
    setText(next);
    setInvalid(false);
    // Typing (or picking) a full name selects it right away.
    const match = find(next);
    if (match && match !== value) onCommit(match);
  }

  function finish() {
    const typed = text.trim();
    if (!typed) {
      setInvalid(false);
      if (value) onCommit("");
      return;
    }
    const match = find(typed);
    if (match) {
      setInvalid(false);
      setText(match);
      if (match !== value) onCommit(match);
    } else {
      // Not a real name: put the saved one back and flag it for a moment.
      setText(value || "");
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1800);
    }
  }

  return (
    <>
      <input
        className={`${className} pd-suggest${invalid ? " invalid" : ""}`}
        type="text"
        list={listId}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        title={invalid ? "Pick one from the list" : undefined}
        autoComplete="off"
        value={text}
        onChange={handleChange}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            finish();
          }
        }}
      />
      <datalist id={listId}>
        {options.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  );
}
