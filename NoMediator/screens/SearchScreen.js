import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { BHK_TYPES } from '../constants/data';
import { api } from '../services/api';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedBHK, setSelectedBHK] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [furnished, setFurnished] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (furnished) filters.furnished = furnished;
      const data = await api.getProperties(filters);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching search properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProperties();
    }, 300); // 300ms debounce for typing search

    return () => clearTimeout(delayDebounce);
  }, [search, maxPrice, furnished]);

  const filtered = properties.filter(p => {
    return selectedBHK.length === 0 || selectedBHK.includes(p.bhk);
  });

  const toggleBHK = (b) => setSelectedBHK(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray} />
          <TextInput style={styles.searchInput} placeholder="Search area, locality..." value={search} onChangeText={setSearch} placeholderTextColor={COLORS.gray} autoFocus />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.gray} /></TouchableOpacity> : null}
        </View>
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          <Text style={styles.filterToggleText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>BHK Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            {BHK_TYPES.map(b => (
              <TouchableOpacity key={b} style={[styles.chip, selectedBHK.includes(b) && styles.chipActive]} onPress={() => toggleBHK(b)}>
                <Text style={[styles.chipText, selectedBHK.includes(b) && styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Max Rent (₹)</Text>
          <TextInput style={styles.filterInput} placeholder="e.g. 30000" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
          <Text style={styles.filterLabel}>Furnishing</Text>
          <View style={styles.furnishRow}>
            {['Furnished', 'Semi-furnished', 'Unfurnished'].map(f => (
              <TouchableOpacity key={f} style={[styles.chip, furnished === f && styles.chipActive]} onPress={() => setFurnished(furnished === f ? '' : f)}>
                <Text style={[styles.chipText, furnished === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>{filtered.length} properties found</Text>

          <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            {filtered.map(p => {
              const hasImage = p.images && p.images.length > 0;
              return (
                <TouchableOpacity key={p.id} style={styles.card} onPress={() => navigation.navigate('Detail', { property: p })} activeOpacity={0.9}>
                  {hasImage ? (
                    <ImageBackground source={{ uri: p.images[0] }} style={styles.cardImg} resizeMode="cover">
                      <View style={styles.cardTag}><Text style={styles.cardTagText}>{p.tag}</Text></View>
                      <View style={styles.postedByBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                        <Text style={styles.postedByText}>Owner</Text>
                      </View>
                    </ImageBackground>
                  ) : (
                    <LinearGradient colors={[p.colorStart, p.colorEnd]} style={styles.cardImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={styles.cardTag}><Text style={styles.cardTagText}>{p.tag}</Text></View>
                      <View style={styles.postedByBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                        <Text style={styles.postedByText}>Owner</Text>
                      </View>
                    </LinearGradient>
                  )}
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.cardPrice}>₹{(p.price/1000).toFixed(0)}K/mo</Text>
                  </View>
                  <View style={styles.cardLocRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.gray} />
                    <Text style={styles.cardLoc}>{p.location}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <MetaItem icon="resize-outline" label={`${p.sqft} sqft`} />
                    <MetaItem icon="bed-outline" label={p.bhk} />
                    <MetaItem icon="home-outline" label={p.furnished} />
                  </View>
                </View>
              </TouchableOpacity>
            )})}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={56} color={COLORS.grayMid} />
                <Text style={styles.emptyTitle}>No properties found</Text>
                <Text style={styles.emptySub}>Try adjusting your filters</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function MetaItem({ icon, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Ionicons name={icon} size={12} color={COLORS.gray} />
      <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  searchHeader: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderColor: COLORS.border, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.grayLight, borderRadius: SIZES.radius, paddingHorizontal: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary, paddingVertical: 10, outlineStyle: 'none' },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radius },
  filterToggleText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  filtersPanel: { backgroundColor: COLORS.white, padding: 14, borderBottomWidth: 0.5, borderColor: COLORS.border },
  filterLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },
  filterInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 8, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: 12, outlineStyle: 'none' },
  furnishRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  resultCount: { fontSize: SIZES.sm, color: COLORS.textSecondary, paddingHorizontal: 16, paddingVertical: 10, fontWeight: '500' },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, marginBottom: 14, overflow: 'hidden', ...SHADOW.small },
  cardImg: { height: 140, justifyContent: 'space-between', padding: 10 },
  cardTag: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  cardTagText: { fontSize: 10, color: COLORS.white, fontWeight: '600' },
  postedByBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  postedByText: { fontSize: 11, color: COLORS.white },
  cardBody: { padding: 12 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  cardTitle: { flex: 1, fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginRight: 8 },
  cardPrice: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.primary },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  cardLoc: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardMeta: { flexDirection: 'row', gap: 10 },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '600', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary },
});
