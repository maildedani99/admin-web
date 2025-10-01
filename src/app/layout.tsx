import type { Metadata } from "next";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeRegistry from "./components/ThemeRegistry";

export const metadata: Metadata = { title: "Admin", description: "Admin Rebirth" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
