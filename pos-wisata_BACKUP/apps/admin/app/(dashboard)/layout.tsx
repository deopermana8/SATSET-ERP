export default function DashboardLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">POS Wisata Dashboard</h1>
      </header>
      <main className="flex-grow p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © {new Date().getFullYear()} POS Wisata. All rights reserved.
      </footer>
    </div>
  );
}