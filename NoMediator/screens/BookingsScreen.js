import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function BookingsScreen({ navigation }) {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (showLoader = true) => {
    if (!token) return;
    if (showLoader) setLoading(true);
    try {
      const data = await api.getServiceBookings(token);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      Alert.alert('Error', 'Could not load service bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(false);
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>Log in to view and track your service bookings.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Log In Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchBookings(true)}>
          <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>Book professional home cleaning, painting, or repair services.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('PaintingCleaning')}>
            <Text style={styles.browseBtnText}>Explore Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{booking.serviceName}</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{booking.planName} Plan</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  booking.status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending
                ]}>
                  <Text style={[
                    styles.statusText,
                    booking.status === 'Confirmed' ? styles.statusTextConfirmed : styles.statusTextPending
                  ]}>{booking.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.detailText}>City: {booking.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.detailText}>
                    Date: {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.detailText}>Time: {booking.bookingTime}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.priceLabel}>Amount Paid / Due:</Text>
                <Text style={styles.priceValue}>₹{booking.price.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  refreshBtn: { padding: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    marginTop: 8,
    ...SHADOW.small
  },
  loginBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.md },
  browseBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    marginTop: 8,
    ...SHADOW.small
  },
  browseBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.md },
  listContainer: { padding: 16, gap: 16, paddingBottom: 32 },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceInfo: { flex: 1, gap: 4 },
  serviceName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  planBadge: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  planBadgeText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: COLORS.successLight },
  statusPending: { backgroundColor: COLORS.warningLight },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextConfirmed: { color: COLORS.success },
  statusTextPending: { color: COLORS.warning },
  cardBody: { gap: 8, paddingBottom: 12, borderBottomWidth: 0.5, borderColor: COLORS.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  priceLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  priceValue: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.primary }
});
