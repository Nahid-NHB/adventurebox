import { Redirect } from 'expo-router';
import { kv } from '@/services/kv';

/**
 * Entry gate. Reads the onboarded flag synchronously from the KV mirror (warmed
 * in the root layout) so there is no onboarding flash. No auth gate here: the
 * app is usable fully offline without an account.
 */
export default function Index() {
  const onboarded = kv.getBool('onboarded');
  return <Redirect href={onboarded ? '/(app)' : '/(onboarding)/child'} />;
}
