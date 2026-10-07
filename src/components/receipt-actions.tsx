"use client";

export default function ReceiptActions() {
  return (
    <div className="receipt-actions no-print">
      <button type="button" onClick={() => window.print()}>Print / save PDF</button>
      <a href="/">Back to shop</a>
    </div>
  );
}
