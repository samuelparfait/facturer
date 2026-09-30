export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount || 0);
}

function getClientHashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).toUpperCase().padStart(4, "0").slice(0, 4);
}

export function generateClientInvoiceNumber(
  clientName: string,
  count = 1,
): string {
  const clean = clientName.trim();
  const prefix = clean ? getClientHashCode(clean) : "INV";
  const year = new Date().getFullYear();
  const sequence = String(count).padStart(4, "0");

  return `${prefix}-${year}-${sequence}`;
}

export function generateInvoiceNumber(sequenceNumber = 1): string {
  const year = new Date().getFullYear();
  const sequence = String(sequenceNumber).padStart(4, "0");
  return `INV-${year}-${sequence}`;
}
