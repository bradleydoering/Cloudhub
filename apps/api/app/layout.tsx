import './globals.css';

export const metadata = {
  title: 'CloudHub API',
  description: 'CloudHub API Server',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}