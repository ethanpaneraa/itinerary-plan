import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div>
      <h1>Itinerary Plan</h1>
      {session ? (
        <p>
          Welcome back, {session.user.name}. <Link to="/trips">View your trips</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> to start planning a trip.
        </p>
      )}
    </div>
  );
}
