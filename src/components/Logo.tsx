import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  size = 28,
  withText = true,
  className,
}: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Klipin"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
      {withText && (
        <span className="font-bold text-lg tracking-tight">Klipin</span>
      )}
    </div>
  );
}
