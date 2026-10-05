"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { AVATAR_MENU_ITEMS, visibleNavItems } from "@/features/shell/nav-items";
import type { Me } from "@/features/shell/types";

export interface AvatarMenuProps {
  user: Me;
}

export function AvatarMenu({ user }: AvatarMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const items = visibleNavItems(AVATAR_MENU_ITEMS, user.role);

  return (
    <div
      ref={rootRef}
      data-testid="avatar-menu-root"
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-testid="avatar-menu-trigger"
        aria-expanded={open}
        aria-controls="avatar-menu"
        aria-label={user.displayName}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary-700"
      >
        <span aria-hidden="true">{user.displayName.charAt(0).toUpperCase()}</span>
      </button>
      <div
        id="avatar-menu"
        data-testid="avatar-menu"
        hidden={!open}
        className="absolute right-0 top-full z-30 mt-1 w-48 rounded-md border border-border bg-surface py-1 shadow-lg"
      >
        {items.map((item) =>
          item.href !== undefined ? (
            <Link
              key={item.id}
              href={item.href}
              data-testid={item.testid}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text hover:bg-surface-muted"
            >
              {t(item.labelKey)}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              data-testid={item.testid}
              onClick={() => {
                setOpen(false);
                void signOut({ callbackUrl: "/" });
              }}
              className="block w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-muted"
            >
              {t(item.labelKey)}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
