import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete04Icon,
  FilePoundIcon,
  Mail01Icon,
  PlusSignIcon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";

import { formatEuro, generateInvoiceNumber } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Item = { id: string; description: string; qty: number; rate: number };

const roundToCents = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export default function InvoiceApp() {
  const [activeTab, setActiveTab] = useState<string>("items");
  const [isReverseCharge, setIsReverseCharge] = useState<boolean>(true);

  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderVatNumber, setSenderVatNumber] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientVatNumber, setClientVatNumber] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    generateInvoiceNumber(1),
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );

  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [bankName, setBankName] = useState("Revolut");
  const [bankIban, setBankIban] = useState("GB46REVO00997031598744");
  const [bankBic, setBankBic] = useState("REVOGB21");
  const [vatPercent, setVatPercent] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      description: "Software Engineering & Architecture",
      qty: 1,
      rate: 0,
    },
  ]);

  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const effectiveInvoiceNumber =
    invoiceNumber.trim() || generateInvoiceNumber(1);

  const rawSubtotal = items.reduce(
    (acc, it) => acc + (it.qty || 0) * (it.rate || 0),
    0,
  );
  const subtotal = roundToCents(rawSubtotal);
  const currentVatRate = isReverseCharge ? 0 : vatPercent;
  const vatAmount = roundToCents(subtotal * (currentVatRate / 100));
  const total = roundToCents(subtotal + vatAmount);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: "", qty: 1, rate: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof Item,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    );
  };

  const handlePrint = useReactToPrint({
    bodyClass: "print-clean",
    documentTitle: effectiveInvoiceNumber,
    contentRef: invoiceRef,
    pageStyle: `
      @page { 
        size: A4 portrait; 
        margin: 15mm; 
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
          background: #ffffff !important;
        }
      }
    `,
  });

  const openMailClient = () => {
    const subject = encodeURIComponent(
      `Invoice ${effectiveInvoiceNumber} from ${senderName || "Sender"}`,
    );
    const bodyLines = [
      `Hi ${clientName || "there"},`,
      "",
      `Please find attached invoice ${effectiveInvoiceNumber} for services rendered.`,
      "",
      `Total Due: ${formatEuro(total)}`,
      "",
      "Kind regards,",
      senderName,
    ];
    window.open(
      `mailto:${clientEmail}?subject=${subject}&body=${encodeURIComponent(
        bodyLines.join("\n"),
      )}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-foreground font-sans antialiased p-4 md:p-6 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        <Card className="px-6 py-3.5 shadow-sm border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={FilePoundIcon} className="h-8 w-8" />

            <div>
              <h1 className="text-base font-bold tracking-tight leading-tight text-foreground">
                Facturer
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Cross-border invoice generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={openMailClient}
              className="text-xs h-9 font-medium gap-2 cursor-pointer"
            >
              <HugeiconsIcon icon={Mail01Icon} className="w-3.5 h-3.5" />
              Email
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 font-medium gap-2 cursor-pointer shadow-xs"
            >
              <HugeiconsIcon icon={PrinterIcon} className="w-3.5 h-3.5" />
              Print / PDF
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full h-11 p-1 bg-muted">
                <TabsTrigger
                  value="sender"
                  className="text-xs font-semibold cursor-pointer"
                >
                  1. Sender
                </TabsTrigger>
                <TabsTrigger
                  value="client"
                  className="text-xs font-semibold cursor-pointer"
                >
                  2. Client
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="text-xs font-semibold cursor-pointer"
                >
                  3. Items
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="text-xs font-semibold cursor-pointer"
                >
                  4. Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sender" className="mt-3">
                <Card className="shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Sender Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Your business or trading credentials.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sName" className="text-xs font-medium">
                        Name / Business Name
                      </Label>
                      <Input
                        id="sName"
                        className="h-9 text-sm"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Acme Studio or Jane Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sAddress" className="text-xs font-medium">
                        Address
                      </Label>
                      <Textarea
                        id="sAddress"
                        rows={2}
                        className="text-sm min-h-[60px]"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        placeholder="e.g. 123 High Street, London, UK"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sVat" className="text-xs font-medium">
                          Tax / VAT ID
                        </Label>
                        <Input
                          id="sVat"
                          className="h-9 text-sm rounded-md"
                          value={senderVatNumber}
                          onChange={(e) => setSenderVatNumber(e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="invNum" className="text-xs font-medium">
                          Invoice #
                        </Label>
                        <Input
                          id="invNum"
                          className="h-9 text-sm rounded-md font-medium"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          placeholder={`e.g. ${generateInvoiceNumber(1)}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="invD" className="text-xs font-medium">
                          Issue Date
                        </Label>
                        <Input
                          id="invD"
                          type="date"
                          className="h-9 text-sm"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dueD" className="text-xs font-medium">
                          Payment Due
                        </Label>
                        <Input
                          id="dueD"
                          type="date"
                          className="h-9 text-sm"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client" className="mt-3">
                <Card className="shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Client Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Recipient business details in Belgium or abroad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cName" className="text-xs font-medium">
                        Client Entity Name
                      </Label>
                      <Input
                        id="cName"
                        className="h-9 text-sm"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Client Company BV"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cVat" className="text-xs font-medium">
                          Client Tax / VAT ID
                        </Label>
                        <Input
                          id="cVat"
                          className="h-9 text-sm rounded-md"
                          value={clientVatNumber}
                          onChange={(e) => setClientVatNumber(e.target.value)}
                          placeholder="e.g. BE 0123.456.789"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cEmail" className="text-xs font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="cEmail"
                          type="email"
                          className="h-9 text-sm"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="e.g. billing@client.be"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cAddress" className="text-xs font-medium">
                        Client Address
                      </Label>
                      <Textarea
                        id="cAddress"
                        rows={2}
                        className="text-sm min-h-[60px]"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        placeholder="e.g. Avenue Louise 100, 1000 Brussels, Belgium"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="mt-3">
                <Card className="shadow-xs">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Line Items & Rates
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Specify all delivered services.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="h-8 text-xs font-medium gap-1 cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="w-3.5 h-3.5"
                      />
                      Add Row
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="p-3 bg-muted/40 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-9 text-sm bg-background flex-1"
                            value={it.description}
                            placeholder="Deliverable description"
                            onChange={(e) =>
                              updateItem(it.id, "description", e.target.value)
                            }
                          />
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(it.id)}
                              className="h-9 w-9 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <HugeiconsIcon
                                icon={Delete04Icon}
                                className="w-4 h-4"
                              />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase">
                              Qty
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              className="h-9 text-sm bg-background tabular-nums rounded-md"
                              value={it.qty || ""}
                              onChange={(e) =>
                                updateItem(it.id, "qty", +e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase">
                              Rate (€)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              className="h-9 text-sm bg-background tabular-nums rounded-md"
                              value={it.rate || ""}
                              onChange={(e) =>
                                updateItem(it.id, "rate", +e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-semibold uppercase">
                              Total
                            </Label>
                            <div className="h-9 px-3 flex items-center bg-muted rounded-md text-xs rounded-md font-semibold text-foreground border border-input">
                              {formatEuro(it.qty * it.rate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="mt-3">
                <Card className="shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Payment & Bank Directives
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Wire transfer and SEPA settlement coordinates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bName" className="text-xs font-medium">
                        Beneficiary Account Name
                      </Label>
                      <Input
                        id="bName"
                        className="h-9 text-sm"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        placeholder="Legal account holder name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="bkName" className="text-xs font-medium">
                          Bank Institution
                        </Label>
                        <Input
                          id="bkName"
                          className="h-9 text-sm"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bkBic" className="text-xs font-medium">
                          BIC / SWIFT
                        </Label>
                        <Input
                          id="bkBic"
                          className="h-9 text-sm rounded-md"
                          value={bankBic}
                          onChange={(e) => setBankBic(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bkIban" className="text-xs font-medium">
                        IBAN
                      </Label>
                      <Input
                        id="bkIban"
                        className="h-9 text-sm rounded-md"
                        value={bankIban}
                        onChange={(e) => setBankIban(e.target.value)}
                      />
                    </div>

                    {!isReverseCharge && (
                      <div className="pt-3 border-t space-y-1.5">
                        <Label htmlFor="vatR" className="text-xs font-medium">
                          Local VAT Rate (%)
                        </Label>
                        <Input
                          id="vatR"
                          type="number"
                          min={0}
                          className="w-24 h-9 text-sm rounded-md"
                          value={vatPercent || ""}
                          onChange={(e) => setVatPercent(+e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <Label
                  htmlFor="reverse-charge"
                  className="text-xs font-semibold cursor-pointer block"
                >
                  Cross-border Reverse Charge (0% VAT)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  EU Directive 2006/112/EC Art. 44 & 196
                </p>
              </div>
              <Switch
                id="reverse-charge"
                checked={isReverseCharge}
                onCheckedChange={setIsReverseCharge}
              />
            </Card>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white rounded-none shadow-xl p-8 md:p-12 border border-slate-200">
              <div
                ref={invoiceRef}
                className="h-full flex flex-col justify-between text-slate-800"
              >
                <div>
                  <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                    <div>
                      <h2 className="text-base font-bold text-slate-950 tracking-tight">
                        {senderName || "Your Company Name"}
                      </h2>
                      <div className="text-xs text-slate-500 whitespace-pre-line mt-0.5 leading-relaxed">
                        {senderAddress ||
                          "Your Registered Address\nCity, Postal Code, Country"}
                      </div>
                      {senderVatNumber ? (
                        <div className="text-xs rounded-md text-slate-600 mt-1">
                          Tax ID: {senderVatNumber}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 mt-1">
                          Sole Trader • Not registered for VAT
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Invoice
                      </div>
                      <div className="rounded-md text-sm font-bold text-slate-900 mt-0.5">
                        #{effectiveInvoiceNumber}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Billed To
                      </div>
                      <div className="font-bold text-slate-900">
                        {clientName || "Client Entity Name"}
                      </div>
                      <div className="whitespace-pre-line text-slate-600 mt-0.5 leading-relaxed">
                        {clientAddress ||
                          "Client Street Address\nCity, Postal Code, Country"}
                      </div>
                      {clientVatNumber && (
                        <div className="rounded-md text-slate-700 mt-1">
                          VAT / Tax ID: {clientVatNumber}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Date / Due
                      </div>
                      <div className="text-slate-600">
                        Issued:{" "}
                        <span className="font-medium text-slate-900 rounded-md">
                          {invoiceDate}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Due:{" "}
                        <span className="font-medium text-slate-900 rounded-md">
                          {dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="text-left pb-2.5">Description</th>
                          <th className="text-center pb-2.5 w-12">Qty</th>
                          <th className="text-right pb-2.5 w-24">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2.5 text-slate-800 leading-normal pr-4">
                              {it.description || "—"}
                            </td>
                            <td className="py-2.5 text-center tabular-nums text-slate-600 rounded-md">
                              {it.qty}
                            </td>
                            <td className="py-2.5 text-right tabular-nums rounded-md text-slate-900 font-medium">
                              {formatEuro(it.qty * it.rate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <div className="w-56 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span className="rounded-md font-medium text-slate-800 tabular-nums">
                          {formatEuro(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>
                          Tax ({isReverseCharge ? "0%" : `${vatPercent}%`}):
                        </span>
                        <span className="rounded-md font-medium text-slate-800 tabular-nums">
                          {formatEuro(vatAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-300 font-bold text-slate-950 text-sm">
                        <span>Total:</span>
                        <span className="rounded-md tabular-nums">
                          {formatEuro(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isReverseCharge && (
                    <div className="mt-8 p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">
                        Reverse Charge Notice:
                      </span>
                      VAT shall be payable by any taxable person, or non-taxable
                      legal person identified for VAT purposes, to whom the
                      services referred to in Article 44 are supplied, if the
                      services are supplied by a taxable person not established
                      within the territory of the Member State.
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500 rounded-md">
                  <div>
                    <div>
                      Beneficiary:{" "}
                      <span className="text-slate-800">
                        {beneficiaryName || senderName || "—"}
                      </span>
                    </div>
                    <div>Bank: {bankName}</div>
                    <div>IBAN: {bankIban}</div>
                    <div>SWIFT/BIC: {bankBic}</div>
                  </div>
                  <div className="text-right text-slate-400">
                    <div>Page 1 of 1</div>
                    <div>A4 Standard Layout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
