import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SavedScreen({ navigation }) {
  const { token } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!token) {
      setSaved([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getFavorites(token);
      setSaved(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [token])
  );

  const remove = async (id) => {
    if (!token) return;
    try {
      await api.toggleFavorite(id, token);
      setSaved(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Properties</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Log in to save and view your favorite properties</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.browseBtnText}>Go to Profile / Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Properties</Text>
        <Text style={styles.headerCount}>{saved.length} saved</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : saved.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>No saved properties</Text>
          <Text style={styles.emptySub}>Tap the heart icon on any listing to save it here</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.browseBtnText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { property: item })} activeOpacity={0.9}>
              {item.images && item.images.length > 0 ? (
                <ImageBackground source={{ uri: item.images[0] }} style={styles.cardImg} resizeMode="cover">
                  <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.id)}>
                    <Ionicons name="heart" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </ImageBackground>
              ) : (
                <LinearGradient colors={[item.colorStart, item.colorEnd]} style={styles.cardImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.id)}>
                    <Ionicons name="heart" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </LinearGradient>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location-outline" size={13} color={COLORS.gray} />
                  <Text style={styles.cardLoc}>{item.location}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>₹{item.price.toLocaleString('en-IN')}/mo</Text>
                  <View style={styles.bhkBadge}>
                    <Text style={styles.bhkText}>{item.bhk}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  headerCount: { fontSize: SIZES.sm, color: COLORS.textSecondary, backgroundColor: COLORS.grayLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '600', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, marginBottom: 14, overflow: 'hidden', ...SHADOW.small },
  cardImg: { height: 130, padding: 12, alignItems: 'flex-end' },
  removeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  cardLoc: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.primary },
  bhkBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bhkText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
});
