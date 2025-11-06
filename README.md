# Facturer

Facturer is a modern invoice creator built with React and Tailwind CSS. Easily generate, preview, and export professional invoices for your clients.

## Features

- Live invoice editing: update sender, client, line items, VAT, and payment details in real time.
- PDF export: download invoices as PDF files.
- Print support: print invoices directly from your browser.
- Email integration: prefill your email client with invoice details for quick sending.
- Responsive design: works seamlessly on desktop and mobile.
- Customizable: change company info, bank details, and invoice formatting.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```sh
pnpm build
```

### Lint

```sh
pnpm lint
```

## Usage

1. Fill in your company and client details.
2. Add invoice line items, quantities, and rates.
3. Adjust VAT if applicable.
4. Preview the invoice.
5. Download as PDF or print.
6. Use "Open Mail Client" to send via email.

## Technologies

- React
- Tailwind CSS
- Vite
- react-to-print
- jspdf
- html2canvas

## Customization

- Update default values in `src/layout.tsx`.
- Change logo in `public/logo.svg`.
- Modify styles in `src/globals.css`.

## License

MIT
