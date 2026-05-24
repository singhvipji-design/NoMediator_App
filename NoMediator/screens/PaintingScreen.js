import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Dimensions, Modal, ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAINTING_CATEGORIES = [
  { name: 'Interior Painting', icon: 'brush-outline', targetIndex: 0 },
  { name: 'Exterior Painting', icon: 'home-outline', targetIndex: 1 },
  { name: 'Rental Painting', icon: 'key-outline', targetIndex: 2 },
  { name: 'Water Proofing', icon: 'water-outline', targetIndex: 4 },
];

const CARDS_DATA = [
  {
    id: 'pt_interior',
    title: 'Interior Painting',
    rating: '4.8 (18K)',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600',
    bullets: [
      '2200+ shades and 1000+ texture ideas',
      'Skilled Painting Partners with 300+ hours of Training',
      'Wall sanding, priming, and minor crack filling included'
    ],
    moreBullets: [
      'Dust-free mechanical sanding for premium finish',
      '1-year warranty on paint peeling and fading',
      'Full furniture masking and post-paint cleanup'
    ],
    prices: { '1 BHK': 18000, '2 BHK': 26000, '3 BHK': 38000, '4+ BHK': 52000 }
  },
  {
    id: 'pt_exterior',
    title: 'Exterior Painting',
    rating: '4.8 (14K)',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600',
    bullets: [
      'Weather-Proof & Anti-Algal Protection',
      'Thorough surface preparation: Jet wash and crack filling included',
      'Accurate quotation with detailed breakup'
    ],
    moreBullets: [
      'Crack filling up to 3mm with poly-fill compound',
      'High-durability external emulsion protection shield',
      'Scaffolding setup and safety protocols certified'
    ],
    prices: { '1 BHK': 22000, '2 BHK': 34000, '3 BHK': 48000, '4+ BHK': 65000 }
  },
  {
    id: 'pt_rental',
    title: 'Rental Painting',
    rating: '4.7 (20k)',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
    bullets: [
      'Quick move-in painting',
      'Complete post-painting cleanup',
      'Budget-friendly pricing'
    ],
    moreBullets: [
      'Single-day completion option for urgent handovers',
      'Standard economy emulsion for refreshing walls',
      'Basic masking of outlets and switchboards'
    ],
    prices: { '1 BHK': 8000, '2 BHK': 12000, '3 BHK': 16000, '4+ BHK': 22000 }
  },
  {
    id: 'pt_oneday',
    title: '1 Day Painting',
    rating: '4.7 (20k)',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    bullets: [
      'Complete Painting in 24 Hours',
      'Best for Rental Move in/out & Quick Touch-ups',
      'Super-Affordable Rates starting @ Rs. 4500'
    ],
    moreBullets: [
      'Executed by a larger, fast-track crew of painters',
      'Express drying paints used to speed up handover',
      'Minimal disruption, perfect for active tenants'
    ],
    prices: { '1 BHK': 4500, '2 BHK': 6500, '3 BHK': 8500, '4+ BHK': 11500 }
  },
  {
    id: 'pt_waterproofing',
    title: 'Water proofing',
    rating: '4.6 (12K)',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
    bullets: [
      'Smart water-leak detection mapping',
      'Multi-layer chemical protection shield',
      'Warranty on dampness protection'
    ],
    moreBullets: [
      'Epoxy-based dampness injection treatment',
      'UV-resistant top coats for terraces and balconies',
      'Thermal imaging leak diagnostics included'
    ],
    prices: { '1 BHK': 12000, '2 BHK': 19000, '3 BHK': 29000, '4+ BHK': 39000 }
  }
];

export default function PaintingScreen({ route, navigation }) {
  const { subService, city } = route?.params || { subService: 'Interior Painting', city: 'Bangalore' };
  const { token } = useAuth();
  const scrollRef = useRef(null);

  // States
  const [expandedCards, setExpandedCards] = useState({});
  const [estimateModalVisible, setEstimateModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBhk, setSelectedBhk] = useState('2 BHK');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleGetEstimate = (card) => {
    setSelectedCard(card);
    setEstimateModalVisible(true);
  };

  const scrollToCard = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: index * 420, // Estimated height of each card
        animated: true
      });
    }
  };

  const handleBookInspection = async () => {
    if (!token) {
      setEstimateModalVisible(false);
      Alert.alert(
        'Authentication Required',
        'Please log in to schedule your painting inspection.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setLoading(true);

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

    const calculatedPrice = selectedCard.prices[selectedBhk];

    try {
      await api.bookService({
        city,
        serviceName: 'Painting - ' + selectedCard.title,
        planName: `${selectedBhk} - Free Inspection`,
        price: calculatedPrice,
        bookingDate: bookingDateStr,
        bookingTime: selectedTime
      }, token);

      setLoading(false);
      setEstimateModalVisible(false);

      Alert.alert(
        'Inspection Scheduled! 🎨',
        `Your free inspection and quotation visit for ${selectedCard.title} (${selectedBhk}) has been booked for ${selectedDate} at ${selectedTime}.`,
        [{ text: 'View Bookings', onPress: () => navigation.navigate('Bookings') }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Painting booking failed:', error);
      Alert.alert('Booking Error', error.message || 'Could not schedule booking.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Painting Choices</Text>
          <Text style={styles.headerSubtitle}>in {city}</Text>
        </View>
        <TouchableOpacity style={styles.bookingsBtn} onPress={() => navigation.navigate('Bookings')}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search One Wall Painting..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Title Block with Mock Banner (Responsive Layout) */}
        <View style={styles.titleBlockContainer}>
          <View style={styles.titleBlockLeft}>
            <Text style={styles.paintingTitle}>Painting</Text>
            <View style={styles.ratingsRow}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingsText}>4.8 <Text style={{ color: COLORS.textSecondary, fontWeight: '500' }}>(2.5 lakh+ bookings near you)</Text></Text>
            </View>
          </View>

          {/* Trusted Banner illustration */}
          <LinearGradient colors={['#b2dfdb', '#e0f2f1']} style={styles.trustedBanner}>
            <View style={styles.bannerBadge}><Text style={styles.bannerBadgeText}>FLAT 15% OFF</Text></View>
            <Text style={styles.bannerTitle}>Trusted by 10K+ Homes</Text>
            <Text style={styles.bannerSub}>High quality wall painting & waterproofing</Text>
          </LinearGradient>
        </View>

        {/* Circular Sub-Categories Selectors */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll} contentContainerStyle={styles.catsContent}>
          {PAINTING_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={styles.catBtn}
              onPress={() => scrollToCard(cat.targetIndex)}
            >
              <LinearGradient colors={['#efebe9', '#d7ccc8']} style={styles.catIconCircle}>
                <Ionicons name={cat.icon} size={22} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.catBtnLabel}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Projects stack */}
        <View style={styles.recentProjectsSection}>
          <View style={styles.recentLeft}>
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, { backgroundColor: '#FF5722' }]}><Text style={styles.avatarText}>A</Text></View>
              <View style={[styles.avatar, { backgroundColor: '#3F51B5', marginLeft: -8 }]}><Text style={styles.avatarText}>M</Text></View>
              <View style={[styles.avatar, { backgroundColor: '#4CAF50', marginLeft: -8 }]}><Text style={styles.avatarText}>R</Text></View>
              <View style={[styles.avatar, { backgroundColor: '#795548', marginLeft: -8 }]}><Text style={styles.avatarText}>+30</Text></View>
            </View>
            <Text style={styles.recentTitle}>Recent Projects</Text>
            <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
          </View>
          <TouchableOpacity style={styles.seeAllBtn} onPress={() => Alert.alert('Recent Projects', 'Explore finished apartments and shades gallery!')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Painting choices */}
        <View style={styles.choicesSection}>
          <Text style={styles.choicesSectionTitle}>Painting choices for your home</Text>

          {CARDS_DATA.map((card) => {
            const isExpanded = expandedCards[card.id];
            return (
              <View key={card.id} style={styles.choiceCard}>
                <Image source={{ uri: card.image }} style={styles.cardImg} />
                <View style={styles.cardRatingBadge}>
                  <Ionicons name="star" size={12} color="#FFC107" />
                  <Text style={styles.ratingBadgeText}>{card.rating}</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{card.title}</Text>

                  <View style={styles.bulletsList}>
                    {card.bullets.map((bullet, index) => (
                      <View key={index} style={styles.bulletRow}>
                        <Ionicons name="checkmark" size={14} color={COLORS.success} style={{ marginTop: 2 }} />
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}

                    {isExpanded && card.moreBullets.map((bullet, index) => (
                      <View key={`more-${index}`} style={styles.bulletRow}>
                        <Ionicons name="checkmark" size={14} color={COLORS.success} style={{ marginTop: 2 }} />
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.showMoreBtn} onPress={() => toggleExpand(card.id)}>
                      <Text style={styles.showMoreText}>{isExpanded ? 'Show less' : 'Show more'} &gt;</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.estimateBtn} onPress={() => handleGetEstimate(card)}>
                      <Text style={styles.estimateBtnText}>GET ESTIMATE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ESTIMATE MODAL */}
      <Modal visible={estimateModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEstimateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.estimateModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Get Free Estimate</Text>
              <TouchableOpacity onPress={() => setEstimateModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedCard && (
              <View style={styles.estimateHeader}>
                <Text style={styles.estimateSubtitle}>{selectedCard.title} in {city}</Text>
                <Text style={styles.calculatedPrice}>
                  Estimated Cost: ₹{selectedCard.prices[selectedBhk].toLocaleString('en-IN')}
                </Text>
                <Text style={styles.priceDisclaimer}>*Final quote will be provided after free physical inspection.</Text>
              </View>
            )}

            {/* BHK Select */}
            <Text style={styles.sectionLabel}>Select House Size (BHK)</Text>
            <View style={styles.bhkGrid}>
              {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map((bhk) => (
                <TouchableOpacity
                  key={bhk}
                  style={[styles.bhkChip, selectedBhk === bhk && styles.bhkChipActive]}
                  onPress={() => setSelectedBhk(bhk)}
                >
                  <Text style={[styles.bhkChipText, selectedBhk === bhk && styles.bhkChipTextActive]}>{bhk}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date Pick */}
            <Text style={styles.sectionLabel}>Select Inspection Date</Text>
            <View style={styles.bhkGrid}>
              {['Tomorrow', 'Day After'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.bhkChip, selectedDate === d && styles.bhkChipActive]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.bhkChipText, selectedDate === d && styles.bhkChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Slot */}
            <Text style={styles.sectionLabel}>Select Time Slot</Text>
            <View style={styles.bhkGrid}>
              {['10:00 AM', '01:00 PM', '04:00 PM'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.bhkChip, selectedTime === t && styles.bhkChipActive]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.bhkChipText, selectedTime === t && styles.bhkChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.bookInspectionBtn} onPress={handleBookInspection} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.bookInspectionBtnText}>Book Free Inspection</Text>
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
  searchSection: { padding: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: SIZES.md, color: COLORS.textPrimary, outlineStyle: 'none' },
  
  // Title block
  titleBlockContainer: {
    flexDirection: Platform.OS === 'web' && SCREEN_WIDTH > 768 ? 'row' : 'column',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20
  },
  titleBlockLeft: { flex: 1, justifyContent: 'center' },
  paintingTitle: { fontSize: SIZES.xxxl, fontWeight: '800', color: COLORS.textPrimary },
  ratingsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  ratingsText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  trustedBanner: {
    flex: 1.2,
    padding: 16,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    position: 'relative',
    ...SHADOW.small
  },
  bannerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  bannerBadgeText: { fontSize: 8, color: COLORS.white, fontWeight: '700' },
  bannerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  bannerSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  // Circular categories
  catsScroll: { paddingVertical: 12, borderBottomWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  catsContent: { paddingHorizontal: 16, gap: 20 },
  catBtn: { alignItems: 'center', gap: 6 },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.small
  },
  catBtnLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  // Recent Projects
  recentProjectsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white
  },
  avatarText: { fontSize: 8, color: COLORS.white, fontWeight: '700' },
  recentTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  newBadge: { backgroundColor: '#3F51B5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  newBadgeText: { fontSize: 8, color: COLORS.white, fontWeight: '700' },
  seeAllBtn: { borderWidth: 1, borderColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  seeAllText: { fontSize: SIZES.sm, color: COLORS.secondary, fontWeight: '600' },

  // Choice Cards
  choicesSection: { paddingHorizontal: 16, gap: 20 },
  choicesSectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  choiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    ...SHADOW.small
  },
  cardImg: { height: 160, width: '100%' },
  cardRatingBadge: {
    position: 'absolute',
    top: 128,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  ratingBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  cardBody: { padding: 16, gap: 12 },
  cardTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  bulletsList: { gap: 8 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletText: { fontSize: SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: COLORS.border,
    paddingTop: 12,
    marginTop: 6
  },
  showMoreBtn: { paddingVertical: 4 },
  showMoreText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  estimateBtn: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  estimateBtnText: { color: COLORS.secondary, fontWeight: '800', fontSize: SIZES.sm },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  estimateModalContent: {
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
  estimateHeader: { backgroundColor: '#E8F5E9', padding: 16, borderRadius: SIZES.radiusMd, gap: 6 },
  estimateSubtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  calculatedPrice: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.success },
  priceDisclaimer: { fontSize: 10, color: COLORS.textSecondary, fontStyle: 'italic' },
  sectionLabel: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  bhkGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  bhkChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.grayLight
  },
  bhkChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  bhkChipText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  bhkChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  bookInspectionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 10
  },
  bookInspectionBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' }
});
