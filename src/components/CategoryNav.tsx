"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-3 flex-wrap">
      {CATEGORIES.map((cat) => {
        const active = pathname === `/category/${cat.slug}`;
        return (
          <Link key={cat.slug} href={`/category/${cat.slug}`}
            className="no-underline px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: active ? cat.color : cat.bgColor,
              color: active ? "#fff" : cat.color,
              fontFamily: "system-ui, sans-serif",
              fontWeight: active ? 600 : 500,
            }}>
            {cat.icon} {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
