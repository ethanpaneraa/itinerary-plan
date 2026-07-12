import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

export const Route = createFileRoute("/trips/")({
  component: Trips,
});

export function Trips() {
  const queryClient = useQueryClient();
  const tripsQuery = useQuery(trpc.trips.list.queryOptions());
  const createTrip = useMutation(
    trpc.trips.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.trips.list.queryKey() });
      },
    }),
  );

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    createTrip.mutate(
      {
        name,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      },
      {
        onSuccess: () => {
          setName("");
          setDestination("");
          setStartDate("");
          setEndDate("");
        },
      },
    );
  }

  if (tripsQuery.isLoading) return <p>Loading trips...</p>;
  if (tripsQuery.isError) return <p role="alert">{tripsQuery.error.message}</p>;

  return (
    <div>
      <h1>Your trips</h1>
      <ul>
        {tripsQuery.data?.map((trip) => (
          <li key={trip.id}>
            <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
              {trip.name} — {trip.destination} ({trip.startDate.slice(0, 10)} to{" "}
              {trip.endDate.slice(0, 10)})
            </Link>
          </li>
        ))}
      </ul>
      {tripsQuery.data?.length === 0 && <p>No trips yet.</p>}

      <h2>New trip</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <label htmlFor="startDate">Start date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <label htmlFor="endDate">End date</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        {createTrip.isError && <p role="alert">{createTrip.error.message}</p>}
        <button type="submit" disabled={createTrip.isPending}>
          Create trip
        </button>
      </form>
    </div>
  );
}
