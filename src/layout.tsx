import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

type Item = { id: string; description: string; qty: number; rate: number };

const bankName = "Barclays";
const bankAccountNumber = "12345678";

export default function InvoiceApp() {
  const [senderName, setSenderName] = useState("Your Name or Company");
  const [senderAddress, setSenderAddress] = useState(
    "12 Example Street, London, UK"
  );
  const [clientName, setClientName] = useState("Client Company");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("Client Address");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [items, setItems] = useState<Item[]>([
    {
      id: String(Date.now()),
      description: "Software development",
      qty: 40,
      rate: 60,
    },
  ]);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  function addItem() {
    setItems((s) => [
      ...s,
      {
        id: String(Date.now() + Math.random()),
        description: "",
        qty: 1,
        rate: 0,
      },
    ]);
  }
  function removeItem(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
  }
  function updateItem(id: string, field: keyof Item, value: string | number) {
    setItems((s) =>
      s.map((it) =>
        it.id === id
          ? ({
              ...it,
              [field]: typeof value === "number" ? value : value,
            } as Item)
          : it
      )
    );
  }

  const subtotal = items.reduce(
    (acc, it) => acc + (it.qty || 0) * (it.rate || 0),
    0
  );
  const vatAmount = +(subtotal * (vatPercent / 100));
  const total = +(subtotal + vatAmount);

  const handlePrint = useReactToPrint({
    bodyClass: "print-agreement",
    documentTitle: `${invoiceNumber || "invoice"}`,
    onAfterPrint: () => console.log("Printed successfully"),
    contentRef: invoiceRef,
    pageStyle: `
      @page { 
        size: A4; 
        margin: 20mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  async function downloadPDF() {
    handlePrint();
  }

  function openMailClient() {
    // mailto cannot attach file automatically. This opens user's email client with prefilled subject and body.
    const subject = encodeURIComponent(
      `Invoice ${invoiceNumber} from ${senderName}`
    );
    const bodyLines = [
      `Hi ${clientName},`,
      "",
      `Please find attached invoice ${invoiceNumber} for services provided.`,
      "",
      `Total: ${total.toFixed(2)} (GBP)`,
      "",
      "Kind regards,",
      senderName,
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    const mailto = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
    window.open(mailto, "_blank");
  }

  /*
    OPTIONAL: Client-side sending via EmailJS (no server required)
    1) npm install emailjs-com
    2) Sign up at https://www.emailjs.com and create a service and template
    3) Replace SERVICE_ID, TEMPLATE_ID, USER_ID below and uncomment
  */
  // async function sendWithEmailJS(pdfBlob: Blob) {
  //   const emailjs = await import('emailjs-com');
  //   emailjs.init('YOUR_EMAILJS_USER_ID');
  //   const base64 = await new Promise<string>(resolve => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve((reader.result as string).split(',')[1]);
  //     reader.readAsDataURL(pdfBlob);
  //   });
  //   const templateParams = {
  //     to_email: clientEmail,
  //     subject: `Invoice ${invoiceNumber}`,
  //     message: `Invoice ${invoiceNumber} attached.`,
  //     attachment: base64,
  //   };
  //   await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', templateParams);
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            <img src="/public/logo.svg" alt="Invoice" width={60} /> Parfait
            Software Solutions
          </h1>
          <div className="space-x-2">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Download PDF
            </button>
            <button
              onClick={openMailClient}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Open Mail Client
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form className="col-span-1 lg:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Invoice Details</h2>
            <label className="block text-sm font-semibold mb-2">
              Your name/company
            </label>
            <input
              className="w-full p-2 border rounded mb-2"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
            <label className="block text-sm font-semibold mb-2">
              Your address
            </label>
            <textarea
              className="w-full p-2 border rounded mb-2"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
            />

            <label className="block text-sm font-semibold mb-2">
              Client name
            </label>
            <input
              className="w-full p-2 border rounded mb-2"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <label className="block text-sm font-semibold mb-2">
              Client email
            </label>
            <input
              className="w-full p-2 border rounded mb-2"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <label className="block text-sm font-semibold mb-2">
              Client address
            </label>
            <textarea
              className="w-full p-2 border rounded mb-2"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />

            <label className="block text-sm font-semibold mb-2">
              Invoice #
            </label>
            <input
              className="w-full p-2 border rounded mb-2"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-2"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2">Due</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">VAT</h3>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={0}
                  className="w-24 p-2 border rounded"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(+e.target.value)}
                />
                <span className="text-sm">% (leave 0 if not applicable)</span>
              </div>
            </div>
          </form>

          <section className="col-span-1 lg:col-span-2 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-4">Line Items</h2>
            <table className="w-full  table-auto mb-4">
              <thead>
                <tr className="text-left text-sm">
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <input
                        className="w-full p-2 border rounded"
                        value={it.description}
                        onChange={(e) =>
                          updateItem(it.id, "description", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 w-24">
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, "qty", +e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 w-32">
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={it.rate}
                        onChange={(e) =>
                          updateItem(it.id, "rate", +e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2">{(it.qty * it.rate).toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-500 text-white rounded"
                        onClick={() => removeItem(it.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mb-4">
              <button
                type="button"
                className="px-3 py-2 bg-indigo-600 text-white rounded"
                onClick={addItem}
              >
                Add item
              </button>
            </div>

            <div className="flex justify-end space-y-1 flex-col">
              <div className="flex justify-between w-full max-w-sm">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-sm">
                <span>VAT ({vatPercent}%)</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-sm font-bold text-lg mt-2">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <aside className="col-span-1 lg:col-span-3">
            <h2 className="font-semibold mb-2">Preview</h2>
            <div
              ref={invoiceRef}
              className="bg-white p-6 rounded shadow w-full max-w-3xl mx-auto"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">{senderName}</h3>
                  <div className="whitespace-pre-line text-sm text-gray-700">
                    {senderAddress}
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold">Invoice</h4>
                  <div>#{invoiceNumber}</div>
                  <div>Date: {invoiceDate}</div>
                  <div>Due: {dueDate}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Bill To</div>
                  <div className="font-semibold">{clientName}</div>
                  <div className="whitespace-pre-line text-sm">
                    {clientAddress}
                  </div>
                </div>
                <div className="text-sm">
                  <div>Payment details</div>
                  <div className="mt-2">Bank: {bankName}</div>
                  <div>Account (IBAN): {bankAccountNumber}</div>
                </div>
              </div>

              <table className="w-full mt-6 text-sm table-fixed">
                <thead>
                  <tr>
                    <th className="text-left pb-2">Description</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Rate</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-1">{it.description}</td>
                      <td className="py-1 text-right">{it.qty}</td>
                      <td className="py-1 text-right">£{it.rate.toFixed(2)}</td>
                      <td className="py-1 text-right">
                        £{(it.qty * it.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end max-w-sm ml-auto">
                <div className="w-full">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>VAT</span>
                    <span>£{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-700">
                Notes: Payment due within 14 days. Thank you for your business.
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
