import type { Metadata } from 'next';
import MuiSetup from './MuiSetup';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin Rebirth',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MuiSetup>{children}</MuiSetup>
      </body>
    </html>
  );
}
