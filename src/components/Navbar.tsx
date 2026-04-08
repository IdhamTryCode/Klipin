import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar({
  rightSlot,
}: {
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="glass-strong flex items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="h-5 w-5 text-brand-300" />
          <span className="font-bold text-lg tracking-tight">Klipin</span>
        </Link>
        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
