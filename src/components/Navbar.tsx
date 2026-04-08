import Link from "next/link";
import Logo from "./Logo";

export default function Navbar({
  rightSlot,
}: {
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="glass-strong flex items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
