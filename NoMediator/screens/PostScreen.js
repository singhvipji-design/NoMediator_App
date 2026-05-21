import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Switch, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STEPS = ['Basic Info', 'Details', 'Amenities', 'Review'];

export default function PostScreen({ navigation }) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [bhk, setBhk] = useState('2 BHK');
  const [sqft, setSqft] = useState('');
  const [type, setType] = useState('Full House');
  const [furnished, setFurnished] = useState('Semi-furnished');
  const [parking, setParking] = useState(false);
  const [gym, setGym] = useState(false);
  const [lift, setLift] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [security, setSecurity] = useState(true);

  const next = () => {
    if (step === 0 && (!title || !location)) { Alert.alert('Required', 'Please fill title and location'); return; }
    if (step === 1 && !price) { Alert.alert('Required', 'Please enter rent amount'); return; }
    if (step < 3) setStep(step + 1);
    else handlePost();
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      const locationParts = location.split(',').map(p => p.trim());
      const area = locationParts[0] || location;
      
      let detectedCity = 'Bengaluru';
      const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
      for (const part of locationParts) {
        const found = CITIES.find(c => c.toLowerCase() === part.toLowerCase());
        if (found) {
          detectedCity = found;
          break;
        }
      }

      const gradients = [
        { start: '#E8121A', end: '#FF6F00' },
        { start: '#1565C0', end: '#00897B' },
        { start: '#6A1B9A', end: '#E8121A' },
        { start: '#2E7D32', end: '#1565C0' },
        { start: '#FF6F00', end: '#E8121A' }
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const propertyData = {
        title,
        location,
        area,
        city: detectedCity,
        price: Number(price),
        deposit: Number(deposit || 0),
        bhk,
        sqft: Number(sqft || 0),
        beds: parseInt(bhk) || 1,
        baths: parseInt(bhk) || 1,
        type,
        furnished,
        parking,
        petFriendly,
        gym,
        lift,
        security,
        colorStart: randomGradient.start,
        colorEnd: randomGradient.end,
        tag: petFriendly ? 'Pet Friendly' : 'Zero Brokerage',
        available: 'Immediate'
      };

      await api.createProperty(propertyData, token);

      Alert.alert('🎉 Listed Successfully!', 'Your property is now live on NoMediator.', [
        { 
          text: 'Go to Home', 
          onPress: () => {
            setStep(0);
            setTitle('');
            setLocation('');
            setPrice('');
            setDeposit('');
            setBhk('2 BHK');
            setSqft('');
            setType('Full House');
            setFurnished('Semi-furnished');
            setParking(false);
            setGym(false);
            setLift(false);
            setPetFriendly(false);
            setSecurity(true);
            navigation.navigate('Home');
          }
        }
      ]);
    } catch (err) {
      console.error('Error posting property:', err);
      Alert.alert('Error', err.message || 'Failed to post property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post Property</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="add-circle-outline" size={64} color={COLORS.grayMid} />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySub}>Log in to post a new property listing for free</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.browseBtnText}>Go to Profile / Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {step > 0 && <TouchableOpacity onPress={() => setStep(step - 1)}><Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} /></TouchableOpacity>}
        <Text style={styles.headerTitle}>Post Property</Text>
        <Text style={styles.stepText}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      {/* Step labels */}
      <View style={styles.stepLabels}>
        {STEPS.map((s, i) => (
          <Text key={s} style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <FormLabel text="Property Title *" />
            <TextInput style={styles.input} placeholder="e.g. 2BHK in Koramangala" value={title} onChangeText={setTitle} placeholderTextColor={COLORS.gray} />
            <FormLabel text="Location / Area *" />
            <TextInput style={styles.input} placeholder="e.g. Koramangala, Bengaluru" value={location} onChangeText={setLocation} placeholderTextColor={COLORS.gray} />
            <FormLabel text="Property Type" />
            <View style={styles.optionRow}>
              {['Full House', 'PG/Hostel', 'Flatmates'].map(t => (
                <TouchableOpacity key={t} style={[styles.optionChip, type === t && styles.optionChipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.optionText, type === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <>
            <FormLabel text="Monthly Rent (₹) *" />
            <TextInput style={styles.input} placeholder="e.g. 25000" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="Security Deposit (₹)" />
            <TextInput style={styles.input} placeholder="e.g. 100000" value={deposit} onChangeText={setDeposit} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="BHK Type" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
              {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK'].map(b => (
                <TouchableOpacity key={b} style={[styles.optionChip, bhk === b && styles.optionChipActive]} onPress={() => setBhk(b)}>
                  <Text style={[styles.optionText, bhk === b && styles.optionTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FormLabel text="Area (sqft)" />
            <TextInput style={styles.input} placeholder="e.g. 1200" value={sqft} onChangeText={setSqft} keyboardType="numeric" placeholderTextColor={COLORS.gray} />
            <FormLabel text="Furnishing" />
            <View style={styles.optionRow}>
              {['Furnished', 'Semi-furnished', 'Unfurnished'].map(f => (
                <TouchableOpacity key={f} style={[styles.optionChip, furnished === f && styles.optionChipActive]} onPress={() => setFurnished(f)}>
                  <Text style={[styles.optionText, furnished === f && styles.optionTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Amenities */}
        {step === 2 && (
          <>
            <ToggleRow label="Parking Available" value={parking} onChange={setParking} />
            <ToggleRow label="Gym" value={gym} onChange={setGym} />
            <ToggleRow label="Lift" value={lift} onChange={setLift} />
            <ToggleRow label="Pet Friendly" value={petFriendly} onChange={setPetFriendly} />
            <ToggleRow label="24/7 Security" value={security} onChange={setSecurity} />
            <TouchableOpacity style={styles.uploadBox}>
              <Ionicons name="camera-outline" size={32} color={COLORS.gray} />
              <Text style={styles.uploadText}>Add Photos & Videos</Text>
              <Text style={styles.uploadSub}>Up to 10 photos, 1 video (optional)</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Review Your Listing</Text>
            <ReviewRow label="Title" value={title} />
            <ReviewRow label="Location" value={location} />
            <ReviewRow label="Type" value={`${type} · ${bhk}`} />
            <ReviewRow label="Rent" value={`₹${price}/month`} />
            {deposit && <ReviewRow label="Deposit" value={`₹${deposit}`} />}
            <ReviewRow label="Furnishing" value={furnished} />
            <ReviewRow label="Parking" value={parking ? 'Yes' : 'No'} />
            <ReviewRow label="Gym" value={gym ? 'Yes' : 'No'} />
            <ReviewRow label="Pet Friendly" value={petFriendly ? 'Yes' : 'No'} />
            <View style={styles.freeNotice}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.freeNoticeText}>This listing is completely <Text style={{ fontWeight: '700' }}>FREE</Text> — Zero Brokerage guaranteed!</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={next} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step === 3 ? 'Post Property' : 'Next'}</Text>
              <Ionicons name={step === 3 ? 'checkmark' : 'arrow-forward'} size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FormLabel({ text }) {
  return <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' }}>{text}</Text>;
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderColor: COLORS.border }}>
      <Text style={{ fontSize: SIZES.md, color: COLORS.textPrimary }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: COLORS.primary }} thumbColor={COLORS.white} />
    </View>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: COLORS.border }}>
      <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  stepText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  progressBar: { height: 4, backgroundColor: COLORS.grayMid },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  stepLabels: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  stepLabel: { flex: 1, fontSize: 10, color: COLORS.gray, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  form: { padding: 16, flexGrow: 1 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 12, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: 16, outlineStyle: 'none' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  optionChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  optionText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.grayMid, borderRadius: SIZES.radius, padding: 32, alignItems: 'center', marginTop: 20, gap: 8 },
  uploadText: { fontSize: SIZES.md, color: COLORS.textSecondary, fontWeight: '500' },
  uploadSub: { fontSize: SIZES.sm, color: COLORS.gray },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 16 },
  reviewTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  freeNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.successLight, padding: 12, borderRadius: SIZES.radius, marginTop: 16 },
  freeNoticeText: { flex: 1, fontSize: SIZES.sm, color: COLORS.success },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 0.5, borderColor: COLORS.border },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 14 },
  nextBtnText: { fontSize: SIZES.lg, color: COLORS.white, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '600', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
});
