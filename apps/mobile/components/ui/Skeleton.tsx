import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SkeletonProps {
  style?: any;
}

export function Skeleton({ style }: SkeletonProps) {
  return <View style={[styles.skeleton, style]} />;
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton style={{ height: 16, width: '40%', marginBottom: 8 }} />
      <Skeleton style={{ height: 28, width: '60%', marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: '80%' }} />
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton style={{ height: 18, width: '35%', marginBottom: 12 }} />
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton style={{ height: 14, width: '70%', marginBottom: 6 }} />
            <Skeleton style={{ height: 12, width: '45%' }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    opacity: 0.7,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
