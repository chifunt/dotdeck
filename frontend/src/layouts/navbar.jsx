import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { Menu } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-rosePine-surface/80 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="font-bold text-xl">
          dotdeck
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/decks/new">
            <Button>Create</Button>
          </Link>

          {user ? (
            <>
              <Link to={`/u/${user.username}`}>
                <img
                  src="/avatar.svg"
                  alt="pfp"
                  className="h-8 w-8 rounded-full"
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <Menu />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
