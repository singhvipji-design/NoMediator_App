import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Dimensions, Modal, Animated, Platform, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CITIES_DATA = [
  { name: 'Bangalore', icon: 'business', color: ['#4A00E0', '#8E2DE2'] },
  { name: 'Mumbai', icon: 'trail-sign', color: ['#FF512F', '#DD2476'] },
  { name: 'Chennai', icon: 'sunny', color: ['#11998e', '#38ef7d'] },
  { name: 'Pune', icon: 'color-palette', color: ['#fc4a1a', '#f7b733'] },
  { name: 'Hyderabad', icon: 'rose', color: ['#7F00FF', '#E100FF'] },
  { name: 'Gurgaon', icon: 'business-sharp', color: ['#00c6ff', '#0072ff'] },
  { name: 'Delhi', icon: 'flag', color: ['#e65c00', '#F9D423'] },
  { name: 'Noida', icon: 'airplane', color: ['#130CB7', '#52E5E7'] },
  { name: 'Greater Noida', icon: 'navigate', color: ['#F2F2F2', '#30CFD0'] },
  { name: 'Ghaziabad', icon: 'construct', color: ['#3A6073', '#3a7bd5'] },
  { name: 'Faridabad', icon: 'options', color: ['#616161', '#9bc5c3'] },
  { name: 'Ahmedabad', icon: 'shirt', color: ['#B3FFAB', '#12FFF7'] },
];

const HUB_SERVICES = [
  { id: 'hc', label: 'Home Cleaning', icon: 'home', badge: 'Upto 60% Off*', color: '#E8121A' },
  { id: 'pm', label: 'Packers & Movers', icon: 'cube', badge: 'Lowest Quote*', color: '#1565C0' },
  { id: 'pt', label: 'Painting', icon: 'brush', badge: 'Flat 25% Off', color: '#6A1B9A' },
  { id: 'sa', label: 'Sales Agreement', icon: 'document-text', badge: null, color: '#00897B' },
  { id: 'ra', label: 'Rental Agreement', icon: 'reader', badge: 'Flat 30% Off*', color: '#2E7D32' },
  { id: 'epc', label: 'Electrician, Plumber & Carpenter', icon: 'build', badge: null, color: '#FF6F00' },
  { id: 'ir', label: 'Interior and Renovation', icon: 'color-wand', badge: null, color: '#EC407A' },
  { id: 'aar', label: 'AC & Appliance Repair', icon: 'construct', badge: 'Upto 30% Off*', color: '#D84315' },
];

const CAROUSEL_SLIDES = [
  {
    title: 'Cleaning Services',
    subtitle: 'Professional deep cleaning starting from ₹399',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    color: '#00897B'
  },
  {
    title: 'Home Painting',
    subtitle: 'Expert consultation & 1-year service warranty',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600',
    color: '#6A1B9A'
  },
  {
    title: 'Packers & Movers',
    subtitle: 'Hassle-free relocation with premium packing',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    color: '#1565C0'
  }
];

export default function PaintingCleaningScreen({ navigation }) {
  const { user, token } = useAuth();
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [subServiceModalVisible, setSubServiceModalVisible] = useState(false);
  const [paintingModalVisible, setPaintingModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Show city selector modal on entry
    setCityModalVisible(true);
  }, []);

  const selectCity = (city) => {
    setSelectedCity(city);
    setCityModalVisible(false);
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
    if (category.id === 'hc') {
      setSubServiceModalVisible(true);
    } else if (category.id === 'pt') {
      setPaintingModalVisible(true);
    } else {
      Alert.alert('Coming Soon', `${category.label} booking is currently in development!`);
    }
  }; const handleSubServiceSelect = (subServiceName) => {
    setSubServiceModalVisible(false);
    navigation.navigate('ServiceDetail', {
      serviceName: subServiceName,
      categoryName: activeCategory.label,
      city: selectedCity || 'Bangalore'
    });
  };

  const handlePaintingSelect = (subName) => {
    setPaintingModalVisible(false);
    navigation.navigate('Painting', {
      subService: subName,
      city: selectedCity || 'Bangalore'
    });
  };

  const nextSlide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  const prevSlide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  const currentSlideData = CAROUSEL_SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.citySelector} onPress={() => setCityModalVisible(true)}>
            <Text style={styles.cityText}>{selectedCity || 'Select City'}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bookingsBtn} onPress={() => navigation.navigate('Bookings')}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.bookingsBtnText}>My Bookings</Text>
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Full House Cleaning, Painting..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories Grid and Carousel split (Responsive style) */}
        <View style={styles.mainLayout}>
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Home Services</Text>
            <View style={styles.grid}>
              {HUB_SERVICES.map((s) => (
                <TouchableOpacity key={s.id} style={styles.gridItem} onPress={() => handleCategoryPress(s)}>
                  <View style={[styles.iconContainer, { backgroundColor: s.color + '15' }]}>
                    <Ionicons name={s.icon} size={26} color={s.color} />
                    {s.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{s.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gridLabel} numberOfLines={2}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interactive Carousel */}
          <View style={styles.carouselContainer}>
            <Animated.View style={[styles.carouselCard, { opacity: fadeAnim, backgroundColor: currentSlideData.color }]}>
              <Image source={{ uri: currentSlideData.image }} style={styles.carouselImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.carouselGradient}>
                <View style={styles.carouselContent}>
                  <Text style={styles.carouselTitle}>{currentSlideData.title}</Text>
                  <Text style={styles.carouselSubtitle}>{currentSlideData.subtitle}</Text>
                  <TouchableOpacity style={styles.bookBtn} onPress={() => {
                    const matchedCat = HUB_SERVICES.find(s => s.label.includes(currentSlideData.title.split(' ')[1] || 'Cleaning'));
                    if (matchedCat) handleCategoryPress(matchedCat);
                    else handleCategoryPress(HUB_SERVICES[0]);
                  }}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Slider Arrows */}
              <TouchableOpacity style={[styles.arrowBtn, styles.arrowLeft]} onPress={prevSlide}>
                <Ionicons name="chevron-back" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.arrowBtn, styles.arrowRight]} onPress={nextSlide}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Offers Section */}
        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>Offers for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
            {/* VIP Card */}
            <LinearGradient colors={['#1a1a1a', '#333333']} style={[styles.offerCard, { borderColor: '#D4AF37', borderWidth: 1 }]}>
              <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>VIP MEMBERSHIP</Text></View>
              <Text style={[styles.offerTitle, { color: '#D4AF37' }]}>Save upto 15% off</Text>
              <Text style={styles.offerSub}>On all home cleaning & painting services.</Text>
              <TouchableOpacity style={[styles.offerCTA, { backgroundColor: '#D4AF37' }]} onPress={() => Alert.alert('Membership', 'VIP Membership activated!')}>
                <Text style={[styles.offerCTAText, { color: '#000' }]}>Buy Now</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Free Tenant Verification */}
            <LinearGradient colors={['#e0f2f1', '#b2dfdb']} style={styles.offerCard}>
              <View style={[styles.offerBadge, { backgroundColor: COLORS.success }]}><Text style={styles.offerBadgeText}>FREE VERIFICATION</Text></View>
              <Text style={[styles.offerTitle, { color: COLORS.textPrimary }]}>Upto 30% off</Text>
              <Text style={[styles.offerSub, { color: COLORS.textSecondary }]}>On professional Rental Agreements.</Text>
              <TouchableOpacity style={[styles.offerCTA, { backgroundColor: COLORS.primary }]} onPress={() => navigation.navigate('Post')}>
                <Text style={styles.offerCTAText}>Create Agreement</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Festive Sale */}
            <LinearGradient colors={['#efebe9', '#d7ccc8']} style={styles.offerCard}>
              <View style={[styles.offerBadge, { backgroundColor: COLORS.accent }]}><Text style={styles.offerBadgeText}>FESTIVE SALE</Text></View>
              <Text style={[styles.offerTitle, { color: COLORS.accent }]}>Flat 15% off</Text>
              <Text style={[styles.offerSub, { color: COLORS.textSecondary }]}>On premium wall painting services.</Text>
              <TouchableOpacity style={[styles.offerCTA, { backgroundColor: COLORS.accent }]} onPress={() => handleCategoryPress(HUB_SERVICES[2])}>
                <Text style={styles.offerCTAText}>Explore Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </View>
      </ScrollView>

      {/* 1. SELECT CITY MODAL */}
      <Modal visible={cityModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.cityModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your City</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.cityGrid}>
              {CITIES_DATA.map((c) => (
                <TouchableOpacity key={c.name} style={styles.cityItem} onPress={() => selectCity(c.name)}>
                  <LinearGradient colors={c.color} style={styles.cityIconContainer}>
                    <Ionicons name={c.icon} size={28} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={styles.cityLabel}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. SUB-SERVICES POPUP MODAL */}
      <Modal visible={subServiceModalVisible} animationType="fade" transparent={true} onRequestClose={() => setSubServiceModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.subServicesModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeCategory?.label}</Text>
              <TouchableOpacity onPress={() => setSubServiceModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.subServicesList}>
              <TouchableOpacity style={styles.subServiceItem} onPress={() => handleSubServiceSelect('Full House Cleaning')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="home-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Full House Cleaning</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handleSubServiceSelect('Kitchen Cleaning')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="restaurant-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Kitchen Cleaning</Text>
                  <View style={[styles.subBadge, { backgroundColor: COLORS.accent }]}><Text style={styles.subBadgeText}>Trending</Text></View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handleSubServiceSelect('Sofa Cleaning')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Sofa Cleaning</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handleSubServiceSelect('Weekly Cleaning')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="repeat-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Weekly Cleaning</Text>
                  <View style={[styles.subBadge, { backgroundColor: COLORS.successLight }]}><Text style={[styles.subBadgeText, { color: COLORS.success }]}>₹180/service</Text></View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handleSubServiceSelect('Bathroom Cleaning')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="water-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Bathroom Cleaning</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. PAINTING SUB-SERVICES POPUP MODAL */}
      <Modal visible={paintingModalVisible} animationType="fade" transparent={true} onRequestClose={() => setPaintingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.subServicesModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Painting</Text>
              <TouchableOpacity onPress={() => setPaintingModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.subServicesList}>
              <TouchableOpacity style={styles.subServiceItem} onPress={() => handlePaintingSelect('Interior Painting')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="brush-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Interior Painting</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handlePaintingSelect('Exterior Painting')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="home-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Exterior Painting</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handlePaintingSelect('Rental Painting')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Rental Painting</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handlePaintingSelect('1 Day Painting')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>1 Day Painting</Text>
                  <View style={[styles.subBadge, { backgroundColor: COLORS.successLight }]}><Text style={[styles.subBadgeText, { color: COLORS.success }]}>Lowest Price</Text></View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.subServiceItem} onPress={() => handlePaintingSelect('Water Proofing')}>
                <View style={styles.subServiceLeft}>
                  <Ionicons name="water-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.subServiceText}>Water Proofing</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  citySelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  bookingsBtnText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  profileBtn: {},
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  loginBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '600' },
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
  mainLayout: {
    flexDirection: Platform.OS === 'web' && SCREEN_WIDTH > 768 ? 'row' : 'column',
    paddingHorizontal: 16,
    gap: 20,
    marginBottom: 24
  },
  categoriesContainer: { flex: 2 },
  sectionTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridItem: {
    width: Platform.OS === 'web' && SCREEN_WIDTH > 768 ? '22%' : '23%',
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...SHADOW.small
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6
  },
  badgeText: { fontSize: 7, color: COLORS.white, fontWeight: '700' },
  gridLabel: { fontSize: 10, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },

  // Carousel CSS
  carouselContainer: { flex: 1, minHeight: 220, alignSelf: 'stretch' },
  carouselCard: {
    flex: 1,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    position: 'relative',
    height: 220,
    ...SHADOW.medium
  },
  carouselImg: { width: '100%', height: '100%', position: 'absolute', opacity: 0.6 },
  carouselGradient: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  carouselContent: { gap: 6 },
  carouselTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.white },
  carouselSubtitle: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.9)' },
  bookBtn: {
    backgroundColor: '#00897B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  bookBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.sm },
  arrowBtn: {
    position: 'absolute',
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },

  // Offers
  offersSection: { paddingHorizontal: 16 },
  offersScroll: { gap: 16, paddingBottom: 10 },
  offerCard: {
    width: 280,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 140,
    ...SHADOW.small
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  offerBadgeText: { fontSize: 9, color: COLORS.white, fontWeight: '700' },
  offerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.white },
  offerSub: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: 12 },
  offerCTA: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  offerCTAText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  cityModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 20,
    ...SHADOW.medium
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 16
  },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, paddingBottom: 10 },
  cityItem: { width: '28%', alignItems: 'center', marginBottom: 12 },
  cityIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW.small
  },
  cityLabel: { fontSize: SIZES.sm, color: COLORS.textPrimary, fontWeight: '500', textAlign: 'center' },

  // Sub Services
  subServicesModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 450,
    padding: 20,
    ...SHADOW.medium
  },
  subServicesList: { gap: 12 },
  subServiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    padding: 16,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  subServiceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  subServiceText: { fontSize: SIZES.md, color: COLORS.textPrimary, fontWeight: '600' },
  subBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  subBadgeText: { fontSize: 8, color: COLORS.white, fontWeight: '700' }
});
