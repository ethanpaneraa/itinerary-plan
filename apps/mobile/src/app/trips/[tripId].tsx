import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '@/components/themed-text';
import { trpc } from '@/lib/trpc';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
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

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');

  function handleSubmit() {
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
          setTitle('');
          setStartTime('');
          setLocation('');
        },
      },
    );
  }

  const sortedItems = [...(itemsQuery.data ?? [])].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Itinerary</ThemedText>

      {itemsQuery.isLoading && <ThemedText>Loading itinerary...</ThemedText>}
      {itemsQuery.isError && (
        <ThemedText testID="error-text">{itemsQuery.error.message}</ThemedText>
      )}

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !itemsQuery.isLoading ? <ThemedText>No itinerary items yet.</ThemedText> : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small">
              {new Date(item.startTime).toLocaleString()}
              {item.location ? ` — ${item.location}` : ''}
            </ThemedText>
          </View>
        )}
      />

      <ThemedText type="subtitle">Add itinerary item</ThemedText>
      <TextInput
        testID="title-input"
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        testID="start-time-input"
        placeholder="Start time (YYYY-MM-DDTHH:mm)"
        value={startTime}
        onChangeText={setStartTime}
        style={styles.input}
      />
      <TextInput
        testID="location-input"
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      {createItem.isError && (
        <ThemedText testID="create-error-text">{createItem.error.message}</ThemedText>
      )}
      <TouchableOpacity
        testID="add-item-button"
        onPress={handleSubmit}
        disabled={createItem.isPending}
        style={styles.button}
      >
        <ThemedText type="linkPrimary">Add item</ThemedText>
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
  itemRow: {
    paddingVertical: 8,
  },
});
