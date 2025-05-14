import type React from "react"

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full relative bg-[#0a0a1f] min-h-screen">
      <div className="block w-px h-full border-l border-border fixed top-0 left-6 z-10"></div>
      <div className="block w-px h-full border-r border-border fixed top-0 right-6 z-10"></div>
      {/* Navbar removed for new homepage design */}
      {children}
    </div>
  );
}
