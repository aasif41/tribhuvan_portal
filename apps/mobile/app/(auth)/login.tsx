import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { COLLEGE, PROGRAMS as FALLBACK_PROGRAMS } from '@tribhuvan/shared';

const AnimatedView = Animated.View as any;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoleType = 'STUDENT' | 'TEACHER';
type TabType = 'LOGIN' | 'SIGNUP';

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 170,
  mass: 0.8,
};

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // ── States ──
  const [role, setRole] = useState<RoleType>('STUDENT');
  const [activeTab, setActiveTab] = useState<TabType>('LOGIN');
  const [availablePrograms, setAvailablePrograms] = useState<{ name: string; code: string }[]>(FALLBACK_PROGRAMS);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal pickers to completely fix the dropdown cut-off bug
  const [modalPickerConfig, setModalPickerConfig] = useState<{
    visible: boolean;
    title: string;
    items: string[];
    selected: string;
    onSelect: (item: string) => void;
  }>({
    visible: false,
    title: '',
    items: [],
    selected: '',
    onSelect: () => {},
  });

  // Animation cycle & direction for clean scene transitions
  const [animationCycle, setAnimationCycle] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Shared values
  const roleToggleX = useSharedValue(0);
  const emblemScale = useSharedValue(1);
  const emblemOpacity = useSharedValue(1);

  // Load programs from API
  useEffect(() => {
    api.get('/programs')
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailablePrograms(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // ── Role Switcher ──
  const handleRoleChange = (newRole: RoleType) => {
    if (newRole === role) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const isTeacher = newRole === 'TEACHER';
    setSlideDirection(isTeacher ? 'left' : 'right');

    if (!prefersReducedMotion) {
      roleToggleX.value = withSpring(isTeacher ? 1 : 0, SPRING_CONFIG);
      emblemScale.value = withTiming(0.92, { duration: 120 }, () => {
        emblemScale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      });
      emblemOpacity.value = withTiming(0.7, { duration: 120 }, () => {
        emblemOpacity.value = withTiming(1, { duration: 180 });
      });
    } else {
      roleToggleX.value = isTeacher ? 1 : 0;
    }

    setRole(newRole);
    setAnimationCycle((c) => c + 1);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  // ── Tab Switcher (Sign In ⟷ Sign Up) ──
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const isSignup = newTab === 'SIGNUP';
    setSlideDirection(isSignup ? 'left' : 'right');

    if (!prefersReducedMotion) {
      emblemScale.value = withTiming(0.95, { duration: 100 }, () => {
        emblemScale.value = withTiming(1, { duration: 160 });
      });
    }

    setActiveTab(newTab);
    setAnimationCycle((c) => c + 1);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  // ── Form Input State ──
  const [sLogin, setSLogin] = useState({ enrollmentNumber: '', password: '' });
  const [sSignup, setSSignup] = useState({
    name: '',
    rollNo: '',
    program: FALLBACK_PROGRAMS[0]?.name || 'B.Tech Computer Science & Engineering',
    year: 1,
    semester: 1,
    section: 'A',
    dateOfBirth: '',
    hostel: '',
    email: '',
    enrollmentNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [tLogin, setTLogin] = useState({ email: '', password: '' });
  const [tSignup, setTSignup] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: FALLBACK_PROGRAMS[0]?.name || 'B.Tech Computer Science & Engineering',
    designation: 'Assistant Professor',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // ── Auth Actions ──
  const doStudentLogin = async () => {
    if (!sLogin.enrollmentNumber.trim() || !sLogin.password) {
      setError('Please enter your Enrollment Number and Password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await api.post('/auth/student/login', sLogin);
      await setSession(r.data.data.token, r.data.data.user);
      router.replace('/(student)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const doStudentSignup = async () => {
    if (
      !sSignup.name.trim() ||
      !sSignup.email.trim() ||
      !sSignup.enrollmentNumber.trim() ||
      !sSignup.password
    ) {
      setError('Please fill in all required fields marked with *');
      return;
    }
    if (sSignup.password !== sSignup.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await api.post('/auth/student/signup', sSignup);
      await setSession(r.data.data.token, r.data.data.user);
      router.replace('/(student)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const doTeacherLogin = async () => {
    if (!tLogin.email.trim() || !tLogin.password) {
      setError('Please enter your institutional email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await api.post('/auth/teacher/login', tLogin);
      await setSession(r.data.data.token, r.data.data.user);
      router.replace('/(teacher)');
    } catch (e: any) {
      const { status, data } = e.response || {};
      if (
        status === 403 &&
        (data?.code === 'PENDING_APPROVAL' || data?.code === 'ACCOUNT_REJECTED')
      ) {
        setPendingNotice(data.message || 'Your faculty account is awaiting administrator approval.');
      } else {
        setError(data?.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const doTeacherSignup = async () => {
    if (!tSignup.name.trim() || !tSignup.email.trim() || !tSignup.employeeId.trim() || !tSignup.password) {
      setError('Please fill in all required fields marked with *');
      return;
    }
    if (tSignup.password !== tSignup.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/teacher/signup', tSignup);
      setSuccessMsg('Faculty application submitted successfully!');
      setActiveTab('LOGIN');
      setPendingNotice('Your faculty account has been registered and is pending administrator verification.');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === 'STUDENT';
  const isLogin = activeTab === 'LOGIN';
  const SWITCHER_WIDTH = SCREEN_WIDTH - 48;
  const PILL_WIDTH = (SWITCHER_WIDTH - 8) / 2;

  // Animated Styles
  const emblemAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emblemScale.value }],
    opacity: emblemOpacity.value,
  }));

  const rolePillStyle = useAnimatedStyle(() => {
    const translateX = interpolate(roleToggleX.value, [0, 1], [0, PILL_WIDTH]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5ee" />
      <SafeAreaView style={st.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={st.keyboardView}
        >
          <ScrollView
            contentContainerStyle={st.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* ═══════════════════════════════════════════════════════ */}
            {/* 1. TOP HEADER & ACADEMIC EMBLEM                         */}
            {/* ═══════════════════════════════════════════════════════ */}
            <View style={st.headerSection}>
              {/* Confident Academic Crest with real visual presence */}
              <AnimatedView style={[st.emblemOuter, emblemAnimStyle]}>
                <View style={st.emblemRing}>
                  <View style={st.emblemCore}>
                    {isStudent ? (
                      <MaterialCommunityIcons name="school" size={34} color="#c8922a" />
                    ) : (
                      <MaterialCommunityIcons name="account-tie" size={34} color="#c8922a" />
                    )}
                  </View>
                </View>
                {/* Diamond Compass Accents */}
                <View style={st.emblemStarTop} />
                <View style={st.emblemStarBottom} />
              </AnimatedView>

              {/* Institution Subtitle */}
              <Text style={st.collegeBrandText}>{COLLEGE.name}</Text>

              {/* State Heading (e.g., "Student Log In" / "Create Account") */}
              <Text style={st.mainHeadingText}>
                {isLogin
                  ? isStudent
                    ? 'Student Log In'
                    : 'Faculty Log In'
                  : isStudent
                  ? 'Student Sign Up'
                  : 'Faculty Sign Up'}
              </Text>

              <Text style={st.mainSubheadText}>
                {isLogin
                  ? isStudent
                    ? 'Welcome back! Enter your details to continue.'
                    : 'Sign in to your departmental portal.'
                  : isStudent
                  ? 'Join Tribhuvan College academic community.'
                  : 'Apply for departmental faculty credentials.'}
              </Text>

              {/* ─── ROLE TOGGLE PILL (Student / Faculty) ─── */}
              <View style={[st.roleSwitcherTrack, { width: SWITCHER_WIDTH }]}>
                {/* Sliding active pill indicator */}
                <AnimatedView
                  style={[
                    st.roleSwitcherPill,
                    { width: PILL_WIDTH },
                    rolePillStyle,
                  ]}
                />

                {/* Student Tab */}
                <Pressable
                  style={st.roleSwitcherButton}
                  onPress={() => handleRoleChange('STUDENT')}
                >
                  <View style={st.roleButtonInner}>
                    <MaterialCommunityIcons
                      name="school-outline"
                      size={18}
                      color={isStudent ? '#ffffff' : '#526079'}
                    />
                    <Text
                      style={[
                        st.roleButtonText,
                        isStudent && st.roleButtonTextActive,
                      ]}
                    >
                      Student
                    </Text>
                  </View>
                </Pressable>

                {/* Faculty Tab */}
                <Pressable
                  style={st.roleSwitcherButton}
                  onPress={() => handleRoleChange('TEACHER')}
                >
                  <View style={st.roleButtonInner}>
                    <MaterialCommunityIcons
                      name="briefcase-account-outline"
                      size={18}
                      color={!isStudent ? '#ffffff' : '#526079'}
                    />
                    <Text
                      style={[
                        st.roleButtonText,
                        !isStudent && st.roleButtonTextActive,
                      ]}
                    >
                      Faculty
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* 2. CLEAN WHITE FORM PANEL                               */}
            {/* ═══════════════════════════════════════════════════════ */}
            <View style={st.formCardWrapper}>
              <View style={st.formCard}>
                {/* Single Clean Scene Transition */}
                <SceneTransition cycle={animationCycle} direction={slideDirection}>
                  {/* Status Banners */}
                  {error && <CleanAlertBanner type="error" message={error} />}
                  {successMsg && <CleanAlertBanner type="success" message={successMsg} />}
                  {pendingNotice && <CleanAlertBanner type="pending" message={pendingNotice} />}

                  {/* ──────────────────────────────────────────────── */}
                  {/* 1. STUDENT LOGIN FORM                            */}
                  {/* ──────────────────────────────────────────────── */}
                  {isStudent && isLogin && (
                    <View style={st.formGroup}>
                      <CleanInputField
                        label="Enrollment Number"
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="TEDS/NU/XXX/XX/XXX"
                          placeholderTextColor="#9ca3af"
                          value={sLogin.enrollmentNumber}
                          onChangeText={(v) => setSLogin((p) => ({ ...p, enrollmentNumber: v }))}
                          autoCapitalize="characters"
                          autoCorrect={false}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                        rightHeaderEl={
                          <TouchableOpacity
                            onPress={() => setError('Please contact the College IT Helpdesk for password assistance.')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={st.forgotLink}>Forgot password?</Text>
                          </TouchableOpacity>
                        }
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={sLogin.password}
                            onChangeText={(v) => setSLogin((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeIconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanPillButton
                        title="Log In"
                        onPress={doStudentLogin}
                        loading={loading}
                      />
                    </View>
                  )}

                  {/* ──────────────────────────────────────────────── */}
                  {/* 2. STUDENT SIGNUP FORM                           */}
                  {/* ──────────────────────────────────────────────── */}
                  {isStudent && !isLogin && (
                    <View style={st.formGroup}>
                      <CleanInputField
                        label="Full Name"
                        icon={<Ionicons name="person-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="Name"
                          placeholderTextColor="#9ca3af"
                          value={sSignup.name}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, name: v }))}
                        />
                      </CleanInputField>

                      {/* Program Picker with Modal (Zero Cut-Offs) */}
                      <CleanInputField
                        label="Academic Program"
                        icon={<Ionicons name="book-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TouchableOpacity
                          style={st.pickerTriggerButton}
                          onPress={() => {
                            setModalPickerConfig({
                              visible: true,
                              title: 'Select Academic Program',
                              items: availablePrograms.map((p) => p.name),
                              selected: sSignup.program,
                              onSelect: (item) => {
                                setSSignup((p) => ({ ...p, program: item }));
                                setModalPickerConfig((c) => ({ ...c, visible: false }));
                              },
                            });
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={st.pickerTriggerText} numberOfLines={1}>
                            {sSignup.program}
                          </Text>
                          <Ionicons name="chevron-down" size={18} color="#6b7c96" />
                        </TouchableOpacity>
                      </CleanInputField>

                      {/* Year & Semester Grid - Completely accessible & bug-free */}
                      <View style={st.dualSelectorRow}>
                        <View style={st.dualCol}>
                          <Text style={st.miniColLabel}>ACADEMIC YEAR *</Text>
                          <View style={st.chipsRow}>
                            {[1, 2, 3, 4].map((y) => (
                              <TouchableOpacity
                                key={y}
                                style={[
                                  st.yearChip,
                                  sSignup.year === y && st.yearChipActive,
                                ]}
                                onPress={() => {
                                  try {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  } catch {}
                                  setSSignup((p) => ({ ...p, year: y }));
                                }}
                                activeOpacity={0.75}
                              >
                                <Text
                                  style={[
                                    st.yearChipText,
                                    sSignup.year === y && st.yearChipTextActive,
                                  ]}
                                >
                                  Y{y}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={st.dualCol}>
                          <Text style={st.miniColLabel}>SEMESTER *</Text>
                          <View style={st.chipsRow}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <TouchableOpacity
                                key={s}
                                style={[
                                  st.semChip,
                                  sSignup.semester === s && st.yearChipActive,
                                ]}
                                onPress={() => {
                                  try {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  } catch {}
                                  setSSignup((p) => ({ ...p, semester: s }));
                                }}
                                activeOpacity={0.75}
                              >
                                <Text
                                  style={[
                                    st.semChipText,
                                    sSignup.semester === s && st.yearChipTextActive,
                                  ]}
                                >
                                  {s}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>

                      <View style={st.fieldDivider} />

                      <CleanInputField
                        label="College Email"
                        icon={<Ionicons name="mail-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="student@tribhuvancollege.ac.in"
                          placeholderTextColor="#9ca3af"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={sSignup.email}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, email: v }))}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Enrollment Number (Login ID)"
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={18} color="#c8922a" />}
                        required
                        highlight
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="TEDS/NU/XXX/XX/XXX"
                          placeholderTextColor="#9ca3af"
                          autoCapitalize="characters"
                          value={sSignup.enrollmentNumber}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, enrollmentNumber: v }))}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={sSignup.password}
                            onChangeText={(v) => setSSignup((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeIconButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanInputField
                        label="Confirm Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showConfirmPassword}
                            value={sSignup.confirmPassword}
                            onChangeText={(v) => setSSignup((p) => ({ ...p, confirmPassword: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword((v) => !v)}
                            style={st.eyeIconButton}
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanPillButton
                        title="Create Account"
                        onPress={doStudentSignup}
                        loading={loading}
                      />
                    </View>
                  )}

                  {/* ──────────────────────────────────────────────── */}
                  {/* 3. TEACHER LOGIN FORM                            */}
                  {/* ──────────────────────────────────────────────── */}
                  {!isStudent && isLogin && (
                    <View style={st.formGroup}>
                      <CleanInputField
                        label="Institutional Email"
                        icon={<Ionicons name="mail-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="faculty@tribhuvancollege.ac.in"
                          placeholderTextColor="#9ca3af"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={tLogin.email}
                          onChangeText={(v) => setTLogin((p) => ({ ...p, email: v }))}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                        rightHeaderEl={
                          <TouchableOpacity
                            onPress={() => setError('Faculty password reset requires administrator assistance.')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={st.forgotLink}>Forgot password?</Text>
                          </TouchableOpacity>
                        }
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={tLogin.password}
                            onChangeText={(v) => setTLogin((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeIconButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanPillButton
                        title="Log In to Faculty Portal"
                        onPress={doTeacherLogin}
                        loading={loading}
                      />
                    </View>
                  )}

                  {/* ──────────────────────────────────────────────── */}
                  {/* 4. TEACHER SIGNUP FORM                           */}
                  {/* ──────────────────────────────────────────────── */}
                  {!isStudent && !isLogin && (
                    <View style={st.formGroup}>
                      <CleanAlertBanner
                        type="pending"
                        message="Faculty registrations are manually reviewed by the college administrator before activation."
                      />

                      <CleanInputField
                        label="Full Name"
                        icon={<Ionicons name="person-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="Name"
                          placeholderTextColor="#9ca3af"
                          value={tSignup.name}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, name: v }))}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Institutional Email (Login ID)"
                        icon={<Ionicons name="mail-outline" size={18} color="#c8922a" />}
                        required
                        highlight
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="teacher@tribhuvancollege.ac.in"
                          placeholderTextColor="#9ca3af"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={tSignup.email}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, email: v }))}
                        />
                      </CleanInputField>

                      <CleanInputField
                        label="Employee ID"
                        icon={<MaterialCommunityIcons name="badge-account-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <TextInput
                          style={st.textInput}
                          placeholder="e.g. TCH-102"
                          placeholderTextColor="#9ca3af"
                          autoCapitalize="characters"
                          value={tSignup.employeeId}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, employeeId: v }))}
                        />
                      </CleanInputField>

                      {/* Department / Program(s) Picker with Modal */}
                      <CleanInputField
                        label="Department / Program(s)"
                        icon={<MaterialCommunityIcons name="domain" size={18} color="#6b7c96" />}
                        required
                      >
                        <TouchableOpacity
                          style={st.pickerTriggerButton}
                          onPress={() => {
                            setModalPickerConfig({
                              visible: true,
                              title: 'Select Department / Program(s)',
                              items: availablePrograms.map((p) => p.name),
                              selected: tSignup.department,
                              onSelect: (item) => {
                                setTSignup((p) => ({ ...p, department: item }));
                                setModalPickerConfig((c) => ({ ...c, visible: false }));
                              },
                            });
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={st.pickerTriggerText} numberOfLines={1}>
                            {tSignup.department}
                          </Text>
                          <Ionicons name="chevron-down" size={18} color="#6b7c96" />
                        </TouchableOpacity>
                      </CleanInputField>

                      <CleanInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={tSignup.password}
                            onChangeText={(v) => setTSignup((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeIconButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanInputField
                        label="Confirm Password"
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#6b7c96" />}
                        required
                      >
                        <View style={st.passwordRow}>
                          <TextInput
                            style={[st.textInput, { flex: 1 }]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showConfirmPassword}
                            value={tSignup.confirmPassword}
                            onChangeText={(v) => setTSignup((p) => ({ ...p, confirmPassword: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword((v) => !v)}
                            style={st.eyeIconButton}
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#6b7c96"
                            />
                          </TouchableOpacity>
                        </View>
                      </CleanInputField>

                      <CleanPillButton
                        title="Submit Faculty Application"
                        onPress={doTeacherSignup}
                        loading={loading}
                      />
                    </View>
                  )}
                </SceneTransition>

                {/* ──────────────────────────────────────────────── */}
                {/* 3. MINIMAL SUPPORTING SWITCH ACTION AT BOTTOM    */}
                {/* ──────────────────────────────────────────────── */}
                <View style={st.switchFooterRow}>
                  <Text style={st.switchFooterText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleTabChange(isLogin ? 'SIGNUP' : 'LOGIN')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={st.switchFooterAction}>
                      {isLogin ? 'Sign Up' : 'Log In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Institutional Footnote */}
              <View style={st.securityFootnote}>
                <Text style={st.securityFootnoteText}>
                  © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 4. MODAL SCROLLABLE PICKER (Solves Dropdown Cut-off)    */}
        {/* ═══════════════════════════════════════════════════════ */}
        <Modal
          visible={modalPickerConfig.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalPickerConfig((c) => ({ ...c, visible: false }))}
        >
          <Pressable
            style={st.modalBackdrop}
            onPress={() => setModalPickerConfig((c) => ({ ...c, visible: false }))}
          >
            <Pressable style={st.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitleText}>{modalPickerConfig.title}</Text>
                <TouchableOpacity
                  style={st.modalCloseBtn}
                  onPress={() => setModalPickerConfig((c) => ({ ...c, visible: false }))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color="#0d1f3c" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={st.modalListScroll}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {modalPickerConfig.items.map((item) => {
                  const isSelected = item === modalPickerConfig.selected;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[st.modalListItem, isSelected && st.modalListItemActive]}
                      onPress={() => modalPickerConfig.onSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          st.modalListItemText,
                          isSelected && st.modalListItemTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#c8922a" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Single calm slide + crossfade transition (280ms)
 */
function SceneTransition({
  cycle,
  direction,
  children,
}: {
  cycle: number;
  direction: 'left' | 'right';
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      opacity.value = 1;
      translateX.value = 0;
      return;
    }

    opacity.value = 0;
    translateX.value = direction === 'left' ? 18 : -18;

    opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [cycle, direction, prefersReducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return <AnimatedView style={[{ width: '100%' }, animStyle]}>{children}</AnimatedView>;
}

/**
 * Clean input field with subtle focus border
 */
function CleanInputField({
  label,
  icon,
  children,
  required,
  highlight,
  rightHeaderEl,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  highlight?: boolean;
  rightHeaderEl?: React.ReactNode;
}) {
  return (
    <View style={st.inputGroup}>
      <View style={st.inputHeaderRow}>
        <View style={st.inputLabelLeft}>
          {icon && <View style={st.inputIconWrap}>{icon}</View>}
          <Text style={[st.inputLabelText, highlight && st.inputLabelTextHighlight]}>
            {label}
            {required && <Text style={st.requiredAsterisk}> *</Text>}
          </Text>
        </View>
        {rightHeaderEl}
      </View>
      <View style={[st.inputContainerBox, highlight && st.inputContainerBoxHighlight]}>
        {children}
      </View>
    </View>
  );
}

/**
 * Clean fully-rounded pill button matching the reference design
 */
function CleanPillButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity
      style={st.pillButton}
      onPress={onPress}
      activeOpacity={0.88}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <View style={st.pillButtonInner}>
          <Text style={st.pillButtonText}>{title}</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Clean alert banner for errors, success, or pending approval
 */
function CleanAlertBanner({
  type,
  message,
}: {
  type: 'error' | 'success' | 'pending';
  message: string;
}) {
  const config = {
    error: {
      bg: '#fdf2f2',
      border: '#f87171',
      text: '#991b1b',
      icon: <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />,
      title: 'Authentication Error',
    },
    success: {
      bg: '#f0fdf4',
      border: '#4ade80',
      text: '#166534',
      icon: <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />,
      title: 'Success',
    },
    pending: {
      bg: '#fffbeb',
      border: '#fbbf24',
      text: '#92400e',
      icon: <Ionicons name="time-outline" size={18} color="#d97706" />,
      title: 'Approval Pending',
    },
  }[type];

  return (
    <View style={[st.alertBox, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={st.alertIconBox}>{config.icon}</View>
      <View style={st.alertContentBox}>
        <Text style={[st.alertTitleText, { color: config.text }]}>{config.title}</Text>
        <Text style={[st.alertMessageText, { color: config.text }]}>{message}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WARM LIGHT BASE + NAVY/GOLD ACCENTS STYLES
// ═══════════════════════════════════════════════════════════════════════════
const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f5ee', // Warm cream foundation
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  // ── HEADER ──
  headerSection: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  emblemOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 146, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 14,
    shadowColor: '#0d1f3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  emblemRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#c8922a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1f3c',
  },
  emblemCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemStarTop: {
    position: 'absolute',
    top: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c8922a',
  },
  emblemStarBottom: {
    position: 'absolute',
    bottom: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c8922a',
  },

  collegeBrandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#c8922a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  mainHeadingText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0d1f3c',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  mainSubheadText: {
    fontSize: 13,
    color: '#6b7c96',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  // ── ROLE TOGGLE (STUDENT / FACULTY) ──
  roleSwitcherTrack: {
    flexDirection: 'row',
    backgroundColor: '#ede7db',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2dacb',
    position: 'relative',
  },
  roleSwitcherPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 20,
    backgroundColor: '#0d1f3c',
    shadowColor: '#0d1f3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  roleSwitcherButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  roleButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526079',
    letterSpacing: 0.2,
  },
  roleButtonTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // ── CLEAN WHITE FORM CARD ──
  formCardWrapper: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e8e1d5',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    shadowColor: '#0d1f3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  formGroup: {
    width: '100%',
  },

  // ── INPUT FIELDS ──
  inputGroup: {
    marginBottom: 16,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconWrap: {
    marginRight: 6,
  },
  inputLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#526079',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputLabelTextHighlight: {
    color: '#c8922a',
  },
  requiredAsterisk: {
    color: '#dc2626',
    fontWeight: '800',
  },
  forgotLink: {
    fontSize: 12,
    color: '#c8922a',
    fontWeight: '700',
  },

  inputContainerBox: {
    backgroundColor: '#faf8f5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4dcce',
    overflow: 'hidden',
  },
  inputContainerBoxHighlight: {
    borderColor: '#c8922a',
    backgroundColor: '#fffdf9',
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0d1f3c',
    fontWeight: '500',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIconButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // ── PICKER TRIGGER BUTTON ──
  pickerTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerTriggerText: {
    fontSize: 13.5,
    color: '#0d1f3c',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },

  // ── DUAL YEAR / SEMESTER SELECTORS ──
  dualSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dualCol: {
    flex: 1,
  },
  miniColLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#526079',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#faf8f5',
    borderWidth: 1,
    borderColor: '#e4dcce',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  semChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#faf8f5',
    borderWidth: 1,
    borderColor: '#e4dcce',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  yearChipActive: {
    backgroundColor: '#0d1f3c',
    borderColor: '#0d1f3c',
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#526079',
  },
  semChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#526079',
  },
  yearChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  fieldDivider: {
    height: 1,
    backgroundColor: '#eee8dd',
    marginVertical: 12,
  },

  // ── PRIMARY PILL BUTTON ──
  pillButton: {
    backgroundColor: '#0d1f3c', // Deep institutional navy
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
    shadowColor: '#0d1f3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pillButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  // ── MINIMAL BOTTOM SWITCH ROW ──
  switchFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2ece2',
  },
  switchFooterText: {
    fontSize: 13,
    color: '#6b7c96',
  },
  switchFooterAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#c8922a', // Brass-gold action link
  },

  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  securityFootnoteText: {
    fontSize: 10.5,
    color: '#8a99ad',
    textAlign: 'center',
  },

  // ── ALERT BANNER ──
  alertBox: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  alertIconBox: {
    marginRight: 10,
    marginTop: 1,
  },
  alertContentBox: {
    flex: 1,
  },
  alertTitleText: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertMessageText: {
    fontSize: 12,
    lineHeight: 16,
  },

  // ── MODAL PICKER (Bug Fix) ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 21, 41, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: 460,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece4',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0d1f3c',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalListScroll: {
    maxHeight: 360,
    paddingHorizontal: 12,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f5ee',
    borderRadius: 12,
  },
  modalListItemActive: {
    backgroundColor: '#fbf8f0',
  },
  modalListItemText: {
    fontSize: 14,
    color: '#2a3b53',
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  modalListItemTextActive: {
    color: '#c8922a',
    fontWeight: '800',
  },
});
