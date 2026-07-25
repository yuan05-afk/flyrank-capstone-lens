import Link from "next/link";

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#101828" />
      <circle cx="20" cy="20" r="10.5" fill="none" stroke="#FEF3C7" strokeWidth="2.3" />
      <circle cx="20" cy="20" r="4.2" fill="none" stroke="#D97706" strokeWidth="2.3" />
      <path d="M20 5v6M20 29v6M5 20h6M29 20h6" stroke="#F59E0B" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M29 10h3v3" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-display font-semibold text-ink focus-ring">
      <BrandMark />
      <span>Lens</span>
    </Link>
  );
}
