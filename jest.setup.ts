import { jest } from '@jest/globals';
import '@testing-library/jest-native/extend-expect';

// Silence reanimated + worklets in the test environment.
jest.mock('react-native-reanimated', () => {
  try {
    return require('react-native-reanimated/mock');
  } catch {
    return {};
  }
});

// AsyncStorage mock (used by the KV service fallback).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
