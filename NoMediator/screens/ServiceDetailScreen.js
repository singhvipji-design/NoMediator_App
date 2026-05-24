import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, Dimensions, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const QUICK_TABS = [
  'Furnished Apartment',
  'Unfurnished Apartment',
  'Furnished Villa',
  'Unfurnished Villa',
  'Book by Room',
  'Mini Services'
];

const PLAN_DATA = {
  'Furnished Apartment': [
    {
      id: 'p1_ess',
      name: 'Essential',
      icon: 'star',
      iconColor: '#FFC107',
      duration: '4 hrs',
      price: 3409,
      features: [
        'Bathroom & kitchen deep cleaning',
        'Machine cleaning of floors, doors & windows',
        'Cobweb removal, ceiling & fan dusting',
        'Balcony & utility area cleaning',
        'Cabinet & furniture exterior dusting & wet wiping'
      ]
    },
    {
      id: 'p1_prem',
      name: 'Premium',
      icon: 'sparkles',
      iconColor: '#00bcd4',
      duration: '4 hrs',
      price: 3759,
      features: [
        'Includes everything in Essential plan',
        'Cupboard cleaning (interior + exterior, if empty)',
        'Cabinets interior with utensil removal',
        'Eco-friendly cleaning agents used'
      ]
    },
    {
      id: 'p1_eli',
      name: 'Elite',
      icon: 'ribbon',
      iconColor: '#E8121A',
      duration: '4 hrs 30 mins',
      price: 4299,
      features: [
        'Includes everything in Premium plan',
        'High-pressure steam sanitization of bathrooms & kitchen',
        'Upholstery shampooing (sofa/mattress up to 5 seats)',
        'Post-cleaning inspection by certified supervisor'
      ]
    }
  ],
  'Unfurnished Apartment': [
    {
      id: 'p2_ess',
      name: 'Essential',
      icon: 'star',
      iconColor: '#FFC107',
      duration: '3 hrs',
      price: 2499,
      features: [
        'Complete wall and floor dusting',
        'Bathroom deep cleaning',
        'Balcony wash & wet wiping',
        'Kitchen sink & counter sanitization'
      ]
    },
    {
      id: 'p2_prem',
      name: 'Premium',
      icon: 'sparkles',
      iconColor: '#00bcd4',
      duration: '3 hrs 30 mins',
      price: 2999,
      features: [
        'Includes everything in Essential plan',
        'Machine scrubbing of floors & tiles',
        'Window pane and slider frame vacuuming',
        'Exhaust fan and light fixtures cleaning'
      ]
    }
  ],
  'Furnished Villa': [
    {
      id: 'p3_ess',
      name: 'Essential',
      icon: 'star',
      iconColor: '#FFC107',
      duration: '6 hrs',
      price: 5499,
      features: [
        'Deep cleaning of up to 3 bedrooms and bathrooms',
        'Kitchen counters, cabinets & tiles deep clean',
        'Floor scrubbing and vacuuming of rugs',
        'Exterior furniture wiping'
      ]
    },
    {
      id: 'p3_prem',
      name: 'Premium',
      icon: 'sparkles',
      iconColor: '#00bcd4',
      duration: '7 hrs',
      price: 6499,
      features: [
        'Includes everything in Essential plan',
        'Steam cleaning of kitchen tiles and bathrooms',
        'Cupboard internal dusting',
        'Terrace and courtyard clean'
      ]
    }
  ],
  'Unfurnished Villa': [
    {
      id: 'p4_ess',
      name: 'Essential',
      icon: 'star',
      iconColor: '#FFC107',
      duration: '5 hrs',
      price: 4499,
      features: [
        'Dusting of walls, window frames & floor plates',
        'Balcony scrubbing',
        'Deep cleaning of all bathrooms'
      ]
    }
  ],
  'Book by Room': [
    {
      id: 'p5_ess',
      name: 'Single Room Deep Clean',
      icon: 'star',
      iconColor: '#FFC107',
      duration: '1 hr 30 mins',
      price: 899,
      features: [
        'Floor cleaning & vacuuming',
        'Windows, mirrors & furniture dusting',
        'Trash removal & ceiling fan cleaning'
      ]
    }
  ],
  'Mini Services': [
    {
      id: 'p6_ess',
      name: 'Kitchen Only Deep Clean',
      icon: 'restaurant',
      iconColor: '#4CAF50',
      duration: '2 hrs',
      price: 1499,
      features: [
        'Degreasing of gas stove & exhaust',
        'Countertop & sink sanitization',
        'Cabinets wiping (exterior)'
      ]
    },
    {
      id: 'p6_prem',
      name: 'Bathroom Only Deep Clean',
      icon: 'water',
      iconColor: '#2196F3',
      duration: '1 hr 30 mins',
      price: 999,
      features: [
        'Wall tiles stain removal',
        'Commode and sink disinfection',
        'Taps & shower scaling cleaning'
      ]
    }
  ]
};

export default function ServiceDetailScreen({ route, navigation }) {
  const { serviceName, city } = route.params;
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Furnished Apartment');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Selected date/time slots
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const handleAddPlan = (plan) => {
    setSelectedPlan(plan);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!token) {
      setBookingModalVisible(false);
      Alert.alert(
        'Authentication Required',
        'Please log in to complete your service booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setLoading(true);
    
    // Prepare date
    let bookingDateStr = '';
    const today = new Date();
    if (selectedDate === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      bookingDateStr = tomorrow.toISOString().split('T')[0];
    } else if (selectedDate === 'Day After') {
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      bookingDateStr = dayAfter.toISOString().split('T')[0];
    } else {
      bookingDateStr = today.toISOString().split('T')[0];
    }

    try {
      await api.bookService({
        city,
        serviceName: serviceName + ' - ' + activeTab,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        bookingDate: bookingDateStr,
        bookingTime: selectedTime
      }, token);

      setLoading(false);
      setBookingModalVisible(false);
      
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ${selectedPlan.name} plan for ${serviceName} in ${city} has been scheduled for ${selectedDate} at ${selectedTime}.`,
        [{ text: 'View Bookings', onPress: () => navigation.navigate('Bookings') }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Booking failed:', error);
      Alert.alert('Booking Error', error.message || 'Could not complete booking.');
    }
  };

  const plansList = PLAN_DATA[activeTab] || [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Best {serviceName} Services</Text>
          <Text style={styles.headerSubtitle}>in {city}</Text>
        </View>
        <TouchableOpacity style={styles.bookingsBtn} onPress={() => navigation.navigate('Bookings')}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="bookmark" size={16} color={COLORS.success} />
            <Text style={styles.statText}>25.5M bookings near you</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.statText}>4.9 (25k reviews)</Text>
          </View>
        </View>

        {/* Quick Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {QUICK_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <LinearGradient colors={['#fffde7', '#fff9c4']} style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Ionicons name="pricetag" size={24} color={COLORS.warning} />
            <View>
              <Text style={styles.promoTitle}>FLAT 10% OFF For New Users</Text>
              <Text style={styles.promoCodeText}>Apply code: <Text style={{fontWeight: '700'}}>NEWCLEAN10</Text></Text>
            </View>
          </View>
          <View style={styles.promoBadge}><Text style={styles.promoBadgeText}>SAVE</Text></View>
        </LinearGradient>

        {/* Plans List */}
        <View style={styles.plansContainer}>
          {plansList.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planCardHeader}>
                <View style={styles.planNameContainer}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Ionicons name={plan.icon} size={18} color={plan.iconColor} />
                </View>
                <View style={styles.planMeta}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{plan.duration}</Text>
                </View>
              </View>

              <Text style={styles.planPrice}>₹{plan.price.toLocaleString('en-IN')}</Text>

              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.planCardFooter}>
                <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => Alert.alert('Plan Details', plan.features.join('\n\n'))}>
                  <Text style={styles.viewDetailsText}>View details &gt;</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddPlan(plan)}>
                  <Text style={styles.addBtnText}>Add</Text>
                  <Text style={styles.addBtnSub}>5 options</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BOOKING MODAL */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent={true} onRequestClose={() => setBookingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bookingModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Booking Slot</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedPlan && (
              <View style={styles.bookingSummary}>
                <Text style={styles.summaryLabel}>Selected Plan:</Text>
                <Text style={styles.summaryValue}>{selectedPlan.name} ({activeTab})</Text>
                <Text style={styles.summaryPrice}>Total Price: ₹{selectedPlan.price.toLocaleString('en-IN')}</Text>
              </View>
            )}

            {/* Date Selection */}
            <Text style={styles.slotSectionTitle}>Select Date</Text>
            <View style={styles.slotGrid}>
              {['Tomorrow', 'Day After'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.slotChip, selectedDate === d && styles.slotChipActive]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.slotChipText, selectedDate === d && styles.slotChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Selection */}
            <Text style={styles.slotSectionTitle}>Select Time Slot</Text>
            <View style={styles.slotGrid}>
              {['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.slotChip, selectedTime === t && styles.slotChipActive]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.slotChipText, selectedTime === t && styles.slotChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm and Book</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  bookingsBtn: { padding: 4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#EEF6F6',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  divider: { width: 1, height: 16, backgroundColor: COLORS.border, marginHorizontal: 16 },
  
  // Tabs Scroll
  tabsScroll: { backgroundColor: COLORS.white, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tabsContent: { paddingHorizontal: 16, gap: 10 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.grayLight
  },
  tabBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  tabBtnText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Promo Banner
  promoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#FBC02D',
    ...SHADOW.small
  },
  promoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  promoCodeText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  promoBadge: { backgroundColor: COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  promoBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },

  // Plans List
  plansContainer: { padding: 16, gap: 16 },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small
  },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planName: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  planPrice: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  featuresList: { gap: 10, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureText: { fontSize: SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  planCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: COLORS.border,
    paddingTop: 12
  },
  viewDetailsBtn: {},
  viewDetailsText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    ...SHADOW.small
  },
  addBtnText: { color: COLORS.secondary, fontWeight: '800', fontSize: SIZES.md },
  addBtnSub: { fontSize: 8, color: COLORS.textSecondary },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bookingModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 500,
    padding: 20,
    gap: 16,
    ...SHADOW.medium
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 12
  },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  bookingSummary: { backgroundColor: COLORS.grayLight, padding: 12, borderRadius: SIZES.radiusMd, gap: 4 },
  summaryLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  summaryPrice: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  slotSectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  slotGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.grayLight
  },
  slotChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  slotChipText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  slotChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 10
  },
  confirmBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' }
});
