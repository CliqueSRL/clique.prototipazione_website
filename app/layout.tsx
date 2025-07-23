import './globals.css';

export const metadata = {
  title: 'Proto-Clique',
  description: 'Prototipazione da CliqueSRL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head />
      <body>
        <div id="background"></div>
        {children}
      </body>
    </html>
  );
}
