import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

export const Route = createFileRoute("/trips/$tripId")({
  component: TripDetail,
});

export function TripDetail() {
  const { tripId } = Route.useParams();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery(trpc.itinerary.listByTrip.queryOptions({ tripId }));
  const createItem = useMutation(
    trpc.itinerary.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.itinerary.listByTrip.queryKey({ tripId }),
        });
      },
    }),
  );

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    createItem.mutate(
      {
        tripId,
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: null,
        location: location || null,
        notes: null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setStartTime("");
          setLocation("");
        },
      },
    );
  }

  if (itemsQuery.isLoading) return <p>Loading itinerary...</p>;
  if (itemsQuery.isError) return <p role="alert">{itemsQuery.error.message}</p>;

  const sortedItems = [...(itemsQuery.data ?? [])].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  return (
    <div>
      <h1>Itinerary</h1>
      <ul>
        {sortedItems.map((item) => (
          <li key={item.id}>
            {new Date(item.startTime).toLocaleString()} — {item.title}
            {item.location ? ` (${item.location})` : ""}
          </li>
        ))}
      </ul>
      {sortedItems.length === 0 && <p>No itinerary items yet.</p>}

      <h2>Add itinerary item</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label htmlFor="startTime">Start time</label>
        <input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <label htmlFor="location">Location</label>
        <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        {createItem.isError && <p role="alert">{createItem.error.message}</p>}
        <button type="submit" disabled={createItem.isPending}>
          Add item
        </button>
      </form>
    </div>
  );
}
