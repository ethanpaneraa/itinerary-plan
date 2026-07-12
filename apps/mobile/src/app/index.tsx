import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { authClient } from '@/lib/auth-client';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Itinerary Plan</ThemedText>
      {session ? (
        <View style={styles.linkGroup}>
          <ThemedText>Welcome back, {session.user.name}.</ThemedText>
          <Link href="/trips">
            <ThemedText type="linkPrimary">View your trips</ThemedText>
          </Link>
        </View>
      ) : (
        <View style={styles.linkGroup}>
          <Link href="/login">
            <ThemedText type="linkPrimary">Log in</ThemedText>
          </Link>
          <Link href="/signup">
            <ThemedText type="linkPrimary">Sign up</ThemedText>
          </Link>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
  },
  linkGroup: {
    alignItems: 'center',
    gap: 12,
  },
});
