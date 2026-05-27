import Link from "next/link";
import { cn } from "@/lib/utils";

// The brand wordmark: italic Playfair Display, forest green, with the JUICE
// sub-label tracked out beneath a hairline rule.
export function Wordmark({ className, sublabel = true }) {
  return (
    <Link href="/" className={cn("inline-flex flex-col leading-none text-primary", className)}>
      <span className="font-display italic text-2xl sm:text-[28px] font-medium">
        Green The World
      </span>
      {sublabel && (
        <span className="mt-1 self-stretch border-t border-primary/60 pt-1 text-center text-[10px] font-medium tracking-[0.4em]">
          JUICE
        </span>
      )}
    </Link>
  );
}
