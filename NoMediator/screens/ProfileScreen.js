import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, updateProfile } = useAuth();
  const [listingsCount, setListingsCount] = useState(0);
  const [visitsCount, setVisitsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Edit Profile States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [listings, visits, saved] = await Promise.all([
        api.getMyListings(token),
        api.getVisits(token),
        api.getFavorites(token)
      ]);
      setListingsCount(listings.length);
      setVisitsCount(visits.length);
      setSavedCount(saved.length);
    } catch (err) {
      console.warn('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [token])
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        logout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleEditProfile = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!editName || !editEmail) {
      Alert.alert('Validation Error', 'Name and Email are required.');
      return;
    }
    setUpdating(true);
    const success = await updateProfile(editName, editEmail, editPhone);
    setUpdating(false);
    if (success) {
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    }
  };

  const handleItemPress = (item) => {
    if (item.label === 'Saved Properties') {
      navigation.navigate('Saved');
    } else if (item.label === 'My Listings') {
      Alert.alert('My Listings', `You have posted ${listingsCount} property listing(s). You can manage them here.`);
    } else if (item.label === 'Scheduled Visits') {
      Alert.alert('Scheduled Visits', `You have scheduled ${visitsCount} visit(s). The owners will coordinate with you.`);
    } else {
      Alert.alert(item.label, `${item.label} will open here.`);
    }
  };

  const menuSections = [
    { section: 'My Activity', items: [
      { icon: 'business-outline', label: 'My Listings', count: listingsCount },
      { icon: 'calendar-outline', label: 'Scheduled Visits', count: visitsCount },
      { icon: 'heart-outline', label: 'Saved Properties', count: savedCount },
      { icon: 'star-outline', label: 'My Reviews', count: null },
    ]},
    { section: 'Documents', items: [
      { icon: 'document-text-outline', label: 'Rental Agreements', count: null },
      { icon: 'receipt-outline', label: 'Rent Receipts', count: null },
    ]},
    { section: 'Account', items: [
      { icon: 'shield-checkmark-outline', label: 'KYC Verification', badge: 'Pending' },
      { icon: 'notifications-outline', label: 'Notifications', count: null },
      { icon: 'help-circle-outline', label: 'Help & Support', count: null },
      { icon: 'settings-outline', label: 'Settings', count: null },
    ]},
  ];

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="person-circle-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Log in to access your profile, list properties, and view scheduled visits</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.browseBtnText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={14} color={COLORS.white} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox value={loading ? '...' : listingsCount} label="Listings" />
          <StatBox value={loading ? '...' : visitsCount} label="Visits" />
          <StatBox value={loading ? '...' : savedCount} label="Saved" />
          <StatBox value="0" label="Reviews" />
        </View>

        {/* Role badge */}
        <View style={styles.roleBanner}>
          <View style={styles.roleBadge}>
            <Ionicons name="person-outline" size={16} color={COLORS.primary} />
            <Text style={styles.roleText}>{user?.role || 'Tenant'}</Text>
          </View>
          <TouchableOpacity style={styles.switchRoleBtn}>
            <Text style={styles.switchRoleText}>Switch to Owner</Text>
            <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {menuSections.map(section => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={item.label} style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]} onPress={() => handleItemPress(item)}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {item.count !== null && item.count !== undefined && <View style={styles.countBadge}><Text style={styles.countText}>{item.count}</Text></View>}
                    {item.badge && <View style={styles.pendingBadge}><Text style={styles.pendingText}>{item.badge}</Text></View>}
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>NoMediator v1.0.0 · Zero Brokerage</Text>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your name"
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.modalLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.modalLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter phone number"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.gray}
              />

              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleSaveChanges}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', padding: 24, paddingBottom: 28 },
  avatarCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: SIZES.xxxl, fontWeight: '700', color: COLORS.white },
  userName: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.white },
  userEmail: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  userPhone: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginTop: 12 },
  editProfileText: { fontSize: SIZES.sm, color: COLORS.white },
  statsRow: { flexDirection: 'row', margin: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 12, alignItems: 'center', ...SHADOW.small },
  statValue: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  roleBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: SIZES.radius, padding: 12, ...SHADOW.small },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  switchRoleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchRoleText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '500' },
  menuSection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 8 },
  menuCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, overflow: 'hidden', ...SHADOW.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 0.5, borderColor: COLORS.border },
  menuIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: { backgroundColor: COLORS.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 11, color: COLORS.white, fontWeight: '700' },
  pendingBadge: { backgroundColor: COLORS.warningLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pendingText: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 16, padding: 14, borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: COLORS.primary },
  logoutText: { fontSize: SIZES.md, color: COLORS.primary, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: SIZES.xs, color: COLORS.gray },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '600', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOW.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalForm: {
    padding: 20,
  },
  modalLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: 16,
    outlineStyle: 'none',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});

