"use client";

import { useState } from "react";

export default function CopyAddress({
  label,
  address,
}: {
  label: string;
  address: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <p>
      {label}:{" "}
      <button
        type="button"
        onClick={copyAddress}
        className="underline hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
      >
        {address.toLowerCase()}
      </button>{" "}
      <span aria-live="polite">{copied && "(copied!)"}</span>
    </p>
  );
}
