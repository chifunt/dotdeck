import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/login-page";
import { SignupPage } from "./pages/signup-page";
import { DeckDetailPage } from "./pages/deck-detail-page";
import { CreateDeckPage } from "./pages/create-deck-page";
import { EditDeckPage } from "./pages/edit-deck-page";
import { ProfilePage } from "./pages/profile-page";
import { AdminPage } from "./pages/admin-page";
import { NotFoundPage } from "./pages/not-found-page";
import { RequireAuth } from "./features/auth/require-auth";

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/decks/new" element={<CreateDeckPage />} />
      <Route path="/decks/:slug" element={<DeckDetailPage />} />
      <Route
        path="/decks/:slug/edit"
        element={
          <RequireAuth>
            <EditDeckPage />
          </RequireAuth>
        }
      />
      <Route path="/u/:username" element={<ProfilePage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
