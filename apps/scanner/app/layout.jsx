import './globals.css';
export const metadata = {
    title: 'SATSET ERP',
    description: 'SATSET ERP foundation application'
};
export default function RootLayout({ children }) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
