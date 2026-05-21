import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DetailScreen({ route, navigation }) {
  const { property } = route.params;
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!token) return;
      try {
        const favs = await api.getFavorites(token);
        const isFav = favs.some(f => f.id === property.id);
        setSaved(isFav);
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };
    checkIfSaved();
  }, [property.id, token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to save properties.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Profile') }
      ]);
      return;
    }
    try {
      const res = await api.toggleFavorite(property.id, token);
      setSaved(res.isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Could not update saved status.');
    }
  };

  const revealContact = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to contact the owner.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Profile') }
      ]);
      return;
    }
    try {
      await api.createInquiry(property.id, token);
      setContactRevealed(true);
      Alert.alert('Owner Contact', `${property.ownerName}\n${property.ownerPhone}`, [{ text: 'Call Now' }, { text: 'Close' }]);
    } catch (err) {
      console.error('Error registering inquiry:', err);
      setContactRevealed(true);
      Alert.alert('Owner Contact', `${property.ownerName}\n${property.ownerPhone}`, [{ text: 'Call Now' }, { text: 'Close' }]);
    }
  };

  const handleScheduleVisit = () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to schedule a visit.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Profile') }
      ]);
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const formatDate = (date) => date.toISOString().split('T')[0];

    Alert.alert(
      'Schedule a Visit',
      'Select a preferred time slot to visit this property:',
      [
        {
          text: `Tomorrow at 10:00 AM`,
          onPress: () => submitVisit(formatDate(tomorrow), '10:00 AM')
        },
        {
          text: `Tomorrow at 4:00 PM`,
          onPress: () => submitVisit(formatDate(tomorrow), '4:00 PM')
        },
        {
          text: `Day After at 11:00 AM`,
          onPress: () => submitVisit(formatDate(dayAfter), '11:00 AM')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const submitVisit = async (date, time) => {
    try {
      await api.scheduleVisit(property.id, date, time, token);
      Alert.alert('Visit Scheduled!', `Your visit is scheduled for ${date} at ${time}. The owner will contact you shortly.`);
    } catch (err) {
      console.error('Error scheduling visit:', err);
      Alert.alert('Booking Failed', err.message || 'Could not schedule visit.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[property.colorStart, property.colorEnd]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleToggleFavorite}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? '#FF5252' : COLORS.white} />
          </TouchableOpacity>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
            <Text style={styles.heroBadgeText}>Posted by Owner · Zero Brokerage</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Price & title */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{property.title}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                <Text style={styles.loc}>{property.location}</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>₹{(property.price/1000).toFixed(0)}K</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <StatBox icon="resize-outline" value={`${property.sqft}`} label="sqft" />
            <StatBox icon="bed-outline" value={property.bhk} label="Type" />
            <StatBox icon="water-outline" value={`${property.baths}`} label="Baths" />
            <StatBox icon="car-outline" value={property.parking ? 'Yes' : 'No'} label="Parking" />
          </View>

          {/* Deposit info */}
          <View style={styles.depositCard}>
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Monthly Rent</Text>
              <Text style={styles.depositValue}>₹{property.price.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.depositDivider} />
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Security Deposit</Text>
              <Text style={styles.depositValue}>₹{property.deposit.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.depositDivider} />
            <View style={styles.depositItem}>
              <Text style={styles.depositLabel}>Available</Text>
              <Text style={[styles.depositValue, { color: COLORS.success }]}>{property.available}</Text>
            </View>
          </View>

          {/* Amenities */}
          <Text style={styles.sectionHead}>Amenities</Text>
          <View style={styles.amenityGrid}>
            <AmenityItem icon="home-outline" label={property.furnished} active />
            {property.parking && <AmenityItem icon="car-outline" label="Parking" active />}
            {property.gym && <AmenityItem icon="barbell-outline" label="Gym" active />}
            {property.lift && <AmenityItem icon="arrow-up-circle-outline" label="Lift" active />}
            {property.security && <AmenityItem icon="shield-outline" label="Security" active />}
            {property.petFriendly && <AmenityItem icon="paw-outline" label="Pet Friendly" active />}
          </View>

          {/* Rating */}
          <Text style={styles.sectionHead}>Ratings & Reviews</Text>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingBig}>{property.rating}</Text>
            <View>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= Math.floor(property.rating) ? 'star' : 'star-outline'} size={18} color='#FF8F00' />)}
              </View>
              <Text style={styles.ratingCount}>{property.reviews} reviews</Text>
            </View>
          </View>

          {/* Owner card */}
          <Text style={styles.sectionHead}>Owner Details</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitials}>{property.ownerName ? property.ownerName.split(' ').map(n => n[0]).join('') : 'O'}</Text>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{property.ownerName || 'Owner'}</Text>
              <View style={styles.ownerBadge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.success} />
                <Text style={styles.ownerBadgeText}>Verified Owner</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactBtn} onPress={revealContact}>
              <Ionicons name="call-outline" size={16} color={COLORS.white} />
              <Text style={styles.contactBtnText}>{contactRevealed ? 'Calling...' : 'Contact'}</Text>
            </TouchableOpacity>
          </View>

          {/* Services */}
          <Text style={styles.sectionHead}>Helpful Services</Text>
          <View style={styles.servicesRow}>
            {[
              { icon: 'cube-outline', label: 'Movers', color: COLORS.primary },
              { icon: 'document-text-outline', label: 'Agreement', color: COLORS.secondary },
              { icon: 'brush-outline', label: 'Cleaning', color: COLORS.accent },
              { icon: 'calculator-outline', label: 'EMI Calc', color: '#6A1B9A' },
            ].map(s => (
              <TouchableOpacity key={s.label} style={styles.serviceItem} onPress={() => Alert.alert(s.label, `${s.label} service will be available here.`)}>
                <View style={[styles.serviceIcon, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                </View>
                <Text style={styles.serviceLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.scheduleBtn} onPress={handleScheduleVisit}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <Text style={styles.scheduleBtnText}>Schedule Visit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBarBtn} onPress={revealContact}>
          <Ionicons name="call-outline" size={18} color={COLORS.white} />
          <Text style={styles.contactBarBtnText}>Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AmenityItem({ icon, label, active }) {
  return (
    <View style={[styles.amenityItem, active && styles.amenityItemActive]}>
      <Ionicons name={icon} size={18} color={active ? COLORS.primary : COLORS.gray} />
      <Text style={[styles.amenityLabel, active && styles.amenityLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 220, justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  heroBadgeText: { fontSize: 12, color: COLORS.white },
  body: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: SIZES.xxxl, fontWeight: '700', color: COLORS.primary },
  priceUnit: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 10, alignItems: 'center', gap: 3, ...SHADOW.small },
  statValue: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary },
  depositCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 14, marginBottom: 20, ...SHADOW.small },
  depositItem: { flex: 1, alignItems: 'center' },
  depositLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  depositValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  depositDivider: { width: 1, backgroundColor: COLORS.border },
  sectionHead: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 4 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  amenityItemActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  amenityLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  amenityLabelActive: { color: COLORS.primary, fontWeight: '500' },
  ratingCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 14, marginBottom: 20, ...SHADOW.small },
  ratingBig: { fontSize: 40, fontWeight: '700', color: COLORS.textPrimary },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
  ratingCount: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  ownerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 14, marginBottom: 20, gap: 12, ...SHADOW.small },
  ownerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  ownerInitials: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.white },
  ownerInfo: { flex: 1 },
  ownerName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ownerBadgeText: { fontSize: 11, color: COLORS.success },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radius },
  contactBtnText: { fontSize: SIZES.sm, color: COLORS.white, fontWeight: '600' },
  servicesRow: { flexDirection: 'row', gap: 12 },
  serviceItem: { flex: 1, alignItems: 'center', gap: 6 },
  serviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  serviceLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 14, backgroundColor: COLORS.white, borderTopWidth: 0.5, borderColor: COLORS.border, gap: 12 },
  scheduleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: COLORS.primary },
  scheduleBtnText: { fontSize: SIZES.md, color: COLORS.primary, fontWeight: '600' },
  contactBarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: SIZES.radius, backgroundColor: COLORS.primary },
  contactBarBtnText: { fontSize: SIZES.md, color: COLORS.white, fontWeight: '600' },
});
