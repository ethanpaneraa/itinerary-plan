import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { trpc } from '@/lib/trpc';

export default function TripsScreen() {
  const queryClient = useQueryClient();
  const tripsQuery = useQuery(trpc.trips.list.queryOptions());
  const createTrip = useMutation(
    trpc.trips.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.trips.list.queryKey() });
      },
    }),
  );

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function handleSubmit() {
    createTrip.mutate(
      {
        name,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      },
      {
        onSuccess: () => {
          setName('');
          setDestination('');
          setStartDate('');
          setEndDate('');
        },
      },
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Your trips</ThemedText>

      {tripsQuery.isLoading && <ThemedText>Loading trips...</ThemedText>}
      {tripsQuery.isError && <ThemedText testID="error-text">{tripsQuery.error.message}</ThemedText>}

      <FlatList
        data={tripsQuery.data ?? []}
        keyExtractor={(trip) => trip.id}
        ListEmptyComponent={
          !tripsQuery.isLoading ? <ThemedText>No trips yet.</ThemedText> : null
        }
        renderItem={({ item }) => (
          <View style={styles.tripRow}>
            <ThemedText type="smallBold">{item.name}</ThemedText>
            <ThemedText type="small">
              {item.destination} ({item.startDate.slice(0, 10)} to {item.endDate.slice(0, 10)})
            </ThemedText>
          </View>
        )}
      />

      <ThemedText type="subtitle">New trip</ThemedText>
      <TextInput
        testID="name-input"
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        testID="destination-input"
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />
      <TextInput
        testID="start-date-input"
        placeholder="Start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
      />
      <TextInput
        testID="end-date-input"
        placeholder="End date (YYYY-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
        style={styles.input}
      />
      {createTrip.isError && (
        <ThemedText testID="create-error-text">{createTrip.error.message}</ThemedText>
      )}
      <TouchableOpacity
        testID="create-trip-button"
        onPress={handleSubmit}
        disabled={createTrip.isPending}
        style={styles.button}
      >
        <ThemedText type="linkPrimary">Create trip</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  button: {
    alignItems: 'center',
    padding: 12,
  },
  tripRow: {
    paddingVertical: 8,
  },
});
