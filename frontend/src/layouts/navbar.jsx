/**
 * @file Top-level navigation bar:
 *   • Brand (left)
 *   • “Create” button (hidden on /decks/new & /decks/:slug/edit)
 *   • Avatar (when logged in)
 *   • Burger pop-over (always – holds profile / auth links)
 */

import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import clsx from "clsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  /* Hide “Create” on the create + edit routes */
  const hideCreate = /^\/decks\/(new|[^/]+\/edit)$/.test(loc.pathname);

  /* ──────────────── Shared pop-over panel ──────────────── */
  const MenuPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={8}
        align="end"
        className={clsx(
          "z-50 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-md",
          "flex flex-col gap-1 p-2",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        )}
      >
        {user ? (
          <>
            <Link
              to={`/u/${user.username}`}
              className="rounded px-3 py-2 hover:bg-accent"
            >
              Profile
            </Link>

            {user.role === "admin" && (
              <Link to="/admin" className="rounded px-3 py-2 hover:bg-accent">
                Admin
              </Link>
            )}

            <button
              onClick={logout}
              className="text-left rounded px-3 py-2 hover:bg-accent"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded px-3 py-2 hover:bg-accent">
              Login
            </Link>
            <Link to="/signup" className="rounded px-3 py-2 hover:bg-accent">
              Sign up
            </Link>
          </>
        )}
      </PopoverContent>
    </Popover>
  );

  /* ──────────────── Render ──────────────── */
  return (
    <header className="sticky top-0 z-40 bg-rosePine-surface/80 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand / home link */}
        <Link to="/" className="text-xl font-bold">
          dotdeck
        </Link>

        {/* Right-hand icons */}
        <div className="flex items-center gap-3">
          {!hideCreate && (
            <Link to="/decks/new">
              <Button>Create</Button>
            </Link>
          )}

          {user && (
            <Link to={`/u/${user.username}`}>
              <img
                src="/avatar.svg"
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
            </Link>
          )}

          {/* Burger (present for guests & users) */}
          <MenuPopover />
        </div>
      </nav>
    </header>
  );
}
