import { useState } from "react";

interface Props {
  label: string;
  value: string;
}

/** A labelled value that copies itself to the clipboard when clicked. */
export default function CopyText({ label, value }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The value is
      // still visible and selectable, so there is nothing else to do.
    }
  }

  return (
    <p>
      {label}:{" "}
      <button type="button" onClick={copy} className="link cursor-pointer text-left break-all">
        {value}
      </button>{" "}
      <span aria-live="polite">{copied ? "(copied!)" : ""}</span>
    </p>
  );
}
