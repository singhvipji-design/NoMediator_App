import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, Modal
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

  const { login, register, loading, loginWithGoogle, loginWithPhoneOTP, sendPhoneOTP } = useAuth();

  // Google Login modal states
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  // Phone OTP login modal states
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpPhone, setOtpPhone] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = Phone, 2 = Code
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  const googleAccounts = [
    { name: 'Lalit Singhs', email: 'singhvipji@gmail.com', avatar: 'LS' },
    { name: 'Tenant User', email: 'tenant@nomediator.com', avatar: 'TU' },
    { name: 'Suresh Kumar', email: 'suresh@nomediator.com', avatar: 'SK' },
  ];

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    const ok = await login(email, password);
    if (!ok) Alert.alert('Error', 'Invalid credentials');
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    await register(name, email, phone, password);
  };

  const handleGoogleSelect = async (gEmail, gName) => {
    setGoogleModalVisible(false);
    await loginWithGoogle(gEmail, gName);
  };

  const handleCustomGoogleSubmit = async () => {
    if (!customGoogleEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setGoogleModalVisible(false);
    const ok = await loginWithGoogle(customGoogleEmail, customGoogleName);
    if (ok) {
      setCustomGoogleEmail('');
      setCustomGoogleName('');
      setShowCustomGoogle(false);
    }
  };

  const handlePhoneInputChange = (text) => {
    if (text.length < 4) {
      setOtpPhone('+91 ');
    } else {
      setOtpPhone(text);
    }
  };

  const handleSendOTP = async () => {
    const cleanPhone = otpPhone.trim();
    if (!cleanPhone.startsWith('+91')) {
      Alert.alert('Invalid Number', 'Phone number must start with +91');
      return;
    }

    const suffix = cleanPhone.substring(3).trim();
    const digitsOnly = suffix.replace(/\s/g, '');
    if (!/^\d{10}$/.test(digitsOnly)) {
      Alert.alert('Invalid Number', 'Please enter exactly 10 digits after the +91 country code.');
      return;
    }

    setSendingOtp(true);
    const res = await sendPhoneOTP(cleanPhone);
    setSendingOtp(false);
    if (res.success) {
      setIsMockMode(res.data?.mockMode === true);
      setOtpStep(2);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    if (isMockMode && otpCode !== '123456') {
      Alert.alert('Invalid OTP', 'The mock OTP is 123456');
      return;
    }
    setOtpModalVisible(false);
    const ok = await loginWithPhoneOTP(otpPhone, otpCode);
    if (ok) {
      setOtpPhone('+91 ');
      setOtpCode('');
      setOtpStep(1);
    }
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
          <TouchableOpacity style={styles.socialBtn} onPress={() => { setShowCustomGoogle(false); setGoogleModalVisible(true); }}>
            <Ionicons name="logo-google" size={20} color='#DB4437' />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, { marginTop: 10 }]} onPress={() => { setOtpStep(1); setOtpPhone('+91 '); setOtpCode(''); setOtpModalVisible(true); }}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.socialText}>Continue with Phone OTP</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>

      {/* Modal 1: Google login chooser */}
      <Modal visible={googleModalVisible} animationType="fade" transparent={true} onRequestClose={() => setGoogleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.googleModalContainer}>
            <View style={styles.googleHeader}>
              <View style={styles.googleIconBox}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </View>
              <Text style={styles.googleTitle}>Sign in with Google</Text>
              <Text style={styles.googleSubtitle}>to continue to NoMediator</Text>
            </View>

            {!showCustomGoogle ? (
              <ScrollView style={styles.accountsList} showsVerticalScrollIndicator={false}>
                {googleAccounts.map((acc, idx) => (
                  <TouchableOpacity key={idx} style={styles.accountRow} onPress={() => handleGoogleSelect(acc.email, acc.name)}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>{acc.avatar}</Text>
                    </View>
                    <View style={styles.accountTextDetails}>
                      <Text style={styles.accountName}>{acc.name}</Text>
                      <Text style={styles.accountEmail}>{acc.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addAccountRow} onPress={() => setShowCustomGoogle(true)}>
                  <View style={[styles.avatarBox, { backgroundColor: COLORS.grayLight }]}>
                    <Ionicons name="person-add" size={16} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.addAccountText}>Use another account</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.customGoogleForm}>
                <Text style={styles.modalInputLabel}>Name</Text>
                <View style={styles.modalInputBox}>
                  <Ionicons name="person-outline" size={16} color={COLORS.gray} />
                  <TextInput style={styles.modalInput} placeholder="Enter your full name" value={customGoogleName} onChangeText={setCustomGoogleName} placeholderTextColor={COLORS.gray} />
                </View>

                <Text style={styles.modalInputLabel}>Gmail Address</Text>
                <View style={styles.modalInputBox}>
                  <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
                  <TextInput style={styles.modalInput} placeholder="name@gmail.com" value={customGoogleEmail} onChangeText={setCustomGoogleEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.gray} />
                </View>

                <View style={styles.modalFormButtons}>
                  <TouchableOpacity style={styles.modalFormCancelBtn} onPress={() => setShowCustomGoogle(false)}>
                    <Text style={styles.modalFormCancelText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalFormSubmitBtn} onPress={handleCustomGoogleSubmit}>
                    <Text style={styles.modalFormSubmitText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.googleCloseBtn} onPress={() => setGoogleModalVisible(false)}>
              <Text style={styles.googleCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Phone OTP Login */}
      <Modal visible={otpModalVisible} animationType="fade" transparent={true} onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.otpModalContainer}>
            <View style={styles.googleHeader}>
              <View style={[styles.googleIconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="call" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.googleTitle}>{otpStep === 1 ? 'Continue with Phone' : 'Enter Verification OTP'}</Text>
              <Text style={styles.googleSubtitle}>
                {otpStep === 1 ? 'Verify your mobile number to sign in.' : `OTP sent to ${otpPhone}`}
              </Text>
            </View>

            {otpStep === 1 ? (
              <View style={styles.otpForm}>
                <Text style={styles.modalInputLabel}>Mobile Number</Text>
                <View style={styles.modalInputBox}>
                  <Ionicons name="call-outline" size={16} color={COLORS.gray} />
                  <TextInput style={styles.modalInput} placeholder="e.g. +91 98765 43210" value={otpPhone} onChangeText={handlePhoneInputChange} keyboardType="phone-pad" placeholderTextColor={COLORS.gray} />
                </View>

                <TouchableOpacity style={styles.otpSubmitBtn} onPress={handleSendOTP} disabled={sendingOtp}>
                  {sendingOtp ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.otpSubmitText}>Send Verification OTP</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.otpForm}>
                {isMockMode && (
                  <View style={styles.otpInfoAlert}>
                    <Ionicons name="information-circle" size={16} color={COLORS.success} />
                    <Text style={styles.otpInfoText}>For local demonstration, enter the mock OTP code: <Text style={{ fontWeight: '700' }}>123456</Text></Text>
                  </View>
                )}

                <Text style={styles.modalInputLabel}>Verification Code (OTP)</Text>
                <View style={styles.modalInputBox}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.gray} />
                  <TextInput style={styles.modalInput} placeholder="Enter 6-digit OTP" value={otpCode} onChangeText={setOtpCode} keyboardType="number-pad" maxLength={6} placeholderTextColor={COLORS.gray} />
                </View>

                <View style={styles.modalFormButtons}>
                  <TouchableOpacity style={styles.modalFormCancelBtn} onPress={() => setOtpStep(1)}>
                    <Text style={styles.modalFormCancelText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalFormSubmitBtn, { backgroundColor: COLORS.primary }]} onPress={handleVerifyOTP}>
                    <Text style={styles.modalFormSubmitText}>Verify & Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.googleCloseBtn} onPress={() => setOtpModalVisible(false)}>
              <Text style={styles.googleCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Modals Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  googleModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'stretch'
  },
  googleHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  googleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  googleTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  googleSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  accountsList: {
    maxHeight: 240,
    marginBottom: 16
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
    gap: 12
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14
  },
  accountTextDetails: {
    flex: 1
  },
  accountName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  accountEmail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12
  },
  addAccountText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500'
  },
  googleCloseBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: COLORS.border,
    marginTop: 8
  },
  googleCloseText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  customGoogleForm: {
    marginBottom: 16
  },
  modalInputLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500'
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 4,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    gap: 10
  },
  modalInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    outlineStyle: 'none'
  },
  modalFormButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  modalFormCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  modalFormCancelText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  modalFormSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    backgroundColor: '#DB4437'
  },
  modalFormSubmitText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '600'
  },
  otpModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'stretch'
  },
  otpForm: {
    marginBottom: 16
  },
  otpSubmitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    marginTop: 8
  },
  otpSubmitText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '700'
  },
  otpInfoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    gap: 8
  },
  otpInfoText: {
    fontSize: 11,
    color: COLORS.success,
    flex: 1
  },
});
