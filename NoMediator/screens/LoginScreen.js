import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, register, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    const ok = await login(email, password);
    if (!ok) Alert.alert('Error', 'Invalid credentials');
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    await register(name, email, phone, password);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={36} color={COLORS.white} />
          </View>
          <Text style={styles.logoText}>NoMediator</Text>
          <Text style={styles.logoSub}>Zero Brokerage. Direct Owner.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'login' && styles.tabActive]} onPress={() => setTab('login')}>
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'register' && styles.tabActive]} onPress={() => setTab('register')}>
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {tab === 'register' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray} />
                <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} placeholderTextColor={COLORS.gray} />
              </View>
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color={COLORS.gray} />
            <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.gray} />
          </View>

          {tab === 'register' && (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={18} color={COLORS.gray} />
                <TextInput style={styles.input} placeholder="+91 XXXXX XXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={COLORS.gray} />
              </View>
            </>
          )}

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray} />
            <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={COLORS.gray} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {tab === 'login' && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={tab === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>{tab === 'login' ? 'Login' : 'Create Account'}</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>OR</Text>
            <View style={styles.divLine} />
          </View>

          {/* Social login */}
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-google" size={20} color='#DB4437' />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, { marginTop: 10 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.socialText}>Continue with Phone OTP</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: SIZES.xxxl, fontWeight: '700', color: COLORS.primary },
  logoSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.grayLight, borderRadius: SIZES.radius, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: SIZES.radius - 2 },
  tabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: SIZES.md, color: COLORS.gray, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  form: { marginBottom: 16 },
  label: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '500' },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: Platform.OS === 'web' ? 12 : 4, marginBottom: 16, backgroundColor: COLORS.white, gap: 10 },
  input: { flex: 1, fontSize: SIZES.md, color: COLORS.textPrimary, outlineStyle: 'none' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -8 },
  forgotText: { fontSize: SIZES.sm, color: COLORS.primary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  submitText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { fontSize: SIZES.sm, color: COLORS.gray },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingVertical: 12 },
  socialText: { fontSize: SIZES.md, color: COLORS.textPrimary, fontWeight: '500' },
  terms: { fontSize: SIZES.xs, color: COLORS.gray, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: COLORS.primary },
});
