import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, FlatList, Platform, Alert, ActivityIndicator, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { SERVICES, PROPERTY_TYPES, CITIES } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HomeScreen({ navigation, route }) {
  const { user, token } = useAuth();
  const [activeType, setActiveType] = useState('Full House');
  const [city, setCity] = useState('Bengaluru');
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.selectCity || route.params?.selectType) {
      if (route.params.selectCity) {
        setCity(route.params.selectCity);
      }
      if (route.params.selectType) {
        setActiveType(route.params.selectType);
      }
      // Clear route parameters so they do not overwrite user filter selections in subsequent screens
      navigation.setParams({ selectCity: undefined, selectType: undefined });
    }
  }, [route.params]);

  const fetchPropertiesAndFavorites = async () => {
    try {
      const props = await api.getProperties({ city, type: activeType, search });
      setProperties(props);

      if (token) {
        const favs = await api.getFavorites(token);
        setFavorites(new Set(favs.map(f => f.id)));
      } else {
        setFavorites(new Set());
      }
    } catch (error) {
      console.error('Error fetching data on HomeScreen:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPropertiesAndFavorites();
    }, [city, activeType, search, token])
  );

  const handleToggleFavorite = async (propertyId) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to save properties.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Profile') }
      ]);
      return;
    }
    try {
      const res = await api.toggleFavorite(propertyId, token);
      const newFavorites = new Set(favorites);
      if (res.isFavorite) {
        newFavorites.add(propertyId);
      } else {
        newFavorites.delete(propertyId);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Could not update saved properties.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hi, {user?.name ? user.name.split(' ')[0] : 'Guest'} 👋</Text>
              <Text style={styles.headerSub}>Find your perfect home</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle-outline" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* City selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
            {CITIES.map(c => (
              <TouchableOpacity key={c} style={[styles.cityChip, city === c && styles.cityChipActive]} onPress={() => setCity(c)}>
                <Text style={[styles.cityText, city === c && styles.cityTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Property type tabs */}
          <View style={styles.typeTabs}>
            {PROPERTY_TYPES.map(t => (
              <TouchableOpacity key={t} style={[styles.typeTab, activeType === t && styles.typeTabActive]} onPress={() => setActiveType(t)}>
                <Text style={[styles.typeTabText, activeType === t && styles.typeTabTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="location-outline" size={18} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search localities or landmarks..."
              placeholderTextColor={COLORS.gray}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Ionicons name="search" size={18} color={COLORS.white} />
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Owner CTA */}
        <TouchableOpacity style={styles.ownerBanner} onPress={() => navigation.navigate('Post')}>
          <View>
            <Text style={styles.ownerBannerTitle}>Are you a Property Owner?</Text>
            <Text style={styles.ownerBannerSub}>Post your property for FREE</Text>
          </View>
          <TouchableOpacity style={styles.ownerBannerBtn} onPress={() => navigation.navigate('Post')}>
            <Text style={styles.ownerBannerBtnText}>Post Free Property Ad</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.serviceItem}
                onPress={() => {
                  if (s.id === 's5') {
                    navigation.navigate('PaintingCleaning');
                  } else {
                    Alert.alert('Coming Soon', `${s.label} service is coming soon!`);
                  }
                }}
              >
                <View style={[styles.serviceIcon, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={24} color={s.color} />
                  {s.badge && <View style={styles.serviceBadge}><Text style={styles.serviceBadgeText}>{s.badge}</Text></View>}
                </View>
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Loan Banner */}
        <View style={styles.loanBanner}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.loanText}>Do you know how much <Text style={{ fontWeight: '700' }}>loan</Text> you can get? Get maximum with NoMediator</Text>
          <TouchableOpacity style={styles.loanBtn}>
            <Text style={styles.loanBtnText}>Check Eligibility</Text>
          </TouchableOpacity>
        </View>

        {/* Property listings */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Latest Listings ({properties.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ padding: 40 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={48} color={COLORS.grayMid} />
              <Text style={styles.emptyText}>No properties found</Text>
            </View>
          ) : (
            properties.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                saved={favorites.has(p.id)}
                onSaveToggle={() => handleToggleFavorite(p.id)}
                onPress={() => navigation.navigate('Detail', { property: p })}
              />
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PropertyCard({ property, saved, onSaveToggle, onPress }) {
  const hasImage = property.images && property.images.length > 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {hasImage ? (
        <ImageBackground source={{ uri: property.images[0] }} style={styles.cardImg} resizeMode="cover">
          <View style={styles.cardTag}><Text style={styles.cardTagText}>{property.tag}</Text></View>
          <TouchableOpacity style={styles.saveBtn} onPress={onSaveToggle}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? COLORS.primary : COLORS.white} />
          </TouchableOpacity>
          <View style={styles.postedByBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
            <Text style={styles.postedByText}>Owner</Text>
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient colors={[property.colorStart, property.colorEnd]} style={styles.cardImg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.cardTag}><Text style={styles.cardTagText}>{property.tag}</Text></View>
          <TouchableOpacity style={styles.saveBtn} onPress={onSaveToggle}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? COLORS.primary : COLORS.white} />
          </TouchableOpacity>
          <View style={styles.postedByBadge}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
            <Text style={styles.postedByText}>Owner</Text>
          </View>
        </LinearGradient>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.cardPrice}>₹{(property.price/1000).toFixed(0)}K/mo</Text>
        </View>
        <View style={styles.cardLocRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.gray} />
          <Text style={styles.cardLoc}>{property.location}</Text>
        </View>
        <View style={styles.cardMeta}>
          <MetaItem icon="resize-outline" label={`${property.sqft} sqft`} />
          <MetaItem icon="bed-outline" label={property.bhk} />
          <MetaItem icon="water-outline" label={`${property.baths} Bath`} />
          {property.furnished && <MetaItem icon="home-outline" label={property.furnished} />}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.depositText}>Deposit: ₹{(property.deposit/1000).toFixed(0)}K</Text>
          <View style={styles.availBadge}>
            <Ionicons name="time-outline" size={11} color={COLORS.success} />
            <Text style={styles.availText}>{property.available}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  header: { padding: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifBtn: {},
  cityChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  cityChipActive: { backgroundColor: COLORS.white },
  cityText: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  cityTextActive: { color: COLORS.primary, fontWeight: '700' },
  typeTabs: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: SIZES.radius, padding: 3, marginBottom: 12 },
  typeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: SIZES.radius - 2 },
  typeTabActive: { backgroundColor: COLORS.white },
  typeTabText: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  typeTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  searchBox: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary, paddingVertical: 12, outlineStyle: 'none' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radius - 2 },
  searchBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '600' },
  ownerBanner: { backgroundColor: COLORS.white, margin: 16, borderRadius: SIZES.radiusMd, padding: 16, flexDirection: Platform.OS === 'web' ? 'row' : 'column', alignItems: Platform.OS === 'web' ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 12, ...SHADOW.small },
  ownerBannerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  ownerBannerSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  ownerBannerBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: SIZES.radius },
  ownerBannerBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceItem: { width: '30%', alignItems: 'center', gap: 8 },
  serviceIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  serviceBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.accent, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 6 },
  serviceBadgeText: { fontSize: 8, color: COLORS.white, fontWeight: '700' },
  serviceLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  loanBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.warningLight, margin: 16, borderRadius: SIZES.radiusMd, padding: 12, gap: 8, flexWrap: 'wrap' },
  loanText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, minWidth: 160 },
  loanBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: SIZES.radius },
  loanBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '600' },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, marginBottom: 16, overflow: 'hidden', ...SHADOW.small },
  cardImg: { height: 160, justifyContent: 'space-between', padding: 12 },
  cardTag: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  cardTagText: { fontSize: 11, color: COLORS.white, fontWeight: '600' },
  saveBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  postedByBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  postedByText: { fontSize: 11, color: COLORS.white },
  cardBody: { padding: 12 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginRight: 8 },
  cardPrice: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.primary },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  cardLoc: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 0.5, borderColor: COLORS.border, paddingTop: 8 },
  depositText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availText: { fontSize: 11, color: COLORS.success, fontWeight: '500' },
  empty: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: SIZES.md, color: COLORS.textSecondary },
});
