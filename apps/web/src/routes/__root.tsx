import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { authClient } from "../lib/auth-client";

function RootLayout() {
  const { data: session } = authClient.useSession();

  return (
    <QueryClientProvider client={queryClient}>
      <nav style={{ display: "flex", gap: 16, padding: 16 }}>
        <Link to="/">Home</Link>
        {session ? (
          <>
            <Link to="/trips">Trips</Link>
            <button type="button" onClick={() => authClient.signOut()}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
