import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import RootLayout from "./layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootLayout />
  </StrictMode>
);
