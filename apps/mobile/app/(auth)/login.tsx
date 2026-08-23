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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { COLLEGE, PROGRAMS as FALLBACK_PROGRAMS } from '@tribhuvan/shared';
import { colors } from '../../constants/colors';

const AnimatedView = Animated.View as any;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RoleType = 'STUDENT' | 'TEACHER';
type TabType = 'LOGIN' | 'SIGNUP';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Environmental Sciences',
  'Information Technology',
  'Basic Sciences & Humanities',
  'Management & Business Studies',
  'Civil & Environmental Engineering',
];

// Spring physics config
const SPRING_CONFIG_SNAPPY = {
  damping: 18,
  stiffness: 150,
  mass: 0.9,
};

const SPRING_CONFIG_BOUNCE = {
  damping: 14,
  stiffness: 140,
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
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  // Trigger token for staggered item animations
  const [animationCycle, setAnimationCycle] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'toRight' | 'toLeft'>('toLeft');

  // ── Reanimated Shared Values ──
  // Header seal reaction
  const sealScale = useSharedValue(1);
  const sealRotate = useSharedValue(0);

  // Role toggle indicator
  const roleToggleX = useSharedValue(0);
  const roleToggleScaleX = useSharedValue(1);

  // Tab indicator
  const tabToggleX = useSharedValue(0);

  // Form container transition
  const formOpacity = useSharedValue(1);

  // Fetch programs
  useEffect(() => {
    api.get('/programs')
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailablePrograms(res.data.data);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  // ── Role switch handler ──
  const handleRoleChange = (newRole: RoleType) => {
    if (newRole === role) return;

    const isTargetTeacher = newRole === 'TEACHER';
    setTransitionDirection(isTargetTeacher ? 'toRight' : 'toLeft');

    if (!prefersReducedMotion) {
      // 1. Morphing role switcher pill animation with spring physics
      roleToggleScaleX.value = withSequence(
        withTiming(1.12, { duration: 120, easing: Easing.out(Easing.quad) }),
        withSpring(1, SPRING_CONFIG_SNAPPY)
      );
      roleToggleX.value = withSpring(isTargetTeacher ? 1 : 0, SPRING_CONFIG_SNAPPY);

      // 2. Seal pulse & subtle wobble
      sealScale.value = withSequence(
        withTiming(1.1, { duration: 160 }),
        withSpring(1, SPRING_CONFIG_BOUNCE)
      );
      sealRotate.value = withSequence(
        withTiming(isTargetTeacher ? 8 : -8, { duration: 160 }),
        withSpring(0, SPRING_CONFIG_BOUNCE)
      );

      // 3. Form fade sequence
      formOpacity.value = withSequence(
        withTiming(0.2, { duration: 100 }),
        withTiming(1, { duration: 250 })
      );
    } else {
      roleToggleX.value = isTargetTeacher ? 1 : 0;
    }

    setRole(newRole);
    setAnimationCycle((c) => c + 1);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  // ── Tab switch handler ──
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    const isSignup = newTab === 'SIGNUP';
    setTransitionDirection(isSignup ? 'toRight' : 'toLeft');

    if (!prefersReducedMotion) {
      tabToggleX.value = withSpring(isSignup ? 1 : 0, SPRING_CONFIG_SNAPPY);
      formOpacity.value = withSequence(
        withTiming(0.2, { duration: 100 }),
        withTiming(1, { duration: 220 })
      );
    } else {
      tabToggleX.value = isSignup ? 1 : 0;
    }

    setActiveTab(newTab);
    setAnimationCycle((c) => c + 1);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  // ── Form State ──
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
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // ── Auth Handlers ──
  const doStudentLogin = async () => {
    if (!sLogin.enrollmentNumber.trim() || !sLogin.password) {
      setError('Please fill in your Enrollment Number and Password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await api.post('/auth/student/login', sLogin);
      await setSession(r.data.data.token, r.data.data.user);
      router.replace('/(student)');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Authentication failed. Please verify your credentials.');
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
        setError(data?.message || 'Authentication failed. Please check your credentials.');
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
      setSuccessMsg('Faculty account submitted successfully!');
      setActiveTab('LOGIN');
      setPendingNotice('Your faculty account has been registered and is pending administrator verification.');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === 'STUDENT';
  const SWITCHER_PADDING = 4;
  const SWITCHER_WIDTH = SCREEN_WIDTH - 48;
  const PILL_WIDTH = (SWITCHER_WIDTH - SWITCHER_PADDING * 2) / 2;

  // ── Animated Styles ──
  const sealAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sealScale.value },
      { rotate: `${sealRotate.value}deg` },
    ],
  }));

  const rolePillStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      roleToggleX.value,
      [0, 1],
      [0, PILL_WIDTH]
    );
    return {
      transform: [
        { translateX },
        { scaleX: roleToggleScaleX.value },
      ],
    };
  });

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (SCREEN_WIDTH - 48) / 2;
    const translateX = interpolate(tabToggleX.value, [0, 1], [0, tabWidth]);
    return {
      transform: [{ translateX }],
    };
  });

  const formWrapAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="#091529" />
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
            {/* INSTITUTIONAL HEADER                                   */}
            {/* ═══════════════════════════════════════════════════════ */}
            <View style={st.headerContainer}>
              {/* Subtle gold decorative hairline */}
              <View style={st.topAccentBar}>
                <View style={st.accentNavy} />
                <View style={st.accentGold} />
                <View style={st.accentNavy} />
              </View>

              {/* Concentric Crest Emblem */}
              <AnimatedView style={[st.crestOuterRing, sealAnimStyle]}>
                <View style={st.crestMidRing}>
                  <View style={st.crestCore}>
                    {isStudent ? (
                      <MaterialCommunityIcons name="school" size={26} color="#f0ece4" />
                    ) : (
                      <MaterialCommunityIcons name="account-tie" size={26} color="#f0ece4" />
                    )}
                  </View>
                </View>
                {/* Micro compass diamonds */}
                <View style={st.sealDotTop} />
                <View style={st.sealDotBottom} />
              </AnimatedView>

              {/* College Title */}
              <Text style={st.collegeTitle}>{COLLEGE.name}</Text>

              {/* Academic Diamond Divider */}
              <View style={st.diamondDivider}>
                <View style={st.diamondLine} />
                <View style={st.diamondShape} />
                <Text style={st.portalTag}>COLLEGE PORTAL</Text>
                <View style={st.diamondShape} />
                <View style={st.diamondLine} />
              </View>

              <Text style={st.headerSubtitle}>
                {isStudent
                  ? 'Student Authentication & Academic Portal'
                  : 'Faculty & Departmental Gateway'}
              </Text>

              {/* ─── MORPHING ROLE SEGMENTED CONTROL ─── */}
              <View style={[st.switcherContainer, { width: SWITCHER_WIDTH }]}>
                <View style={st.switcherTrack}>
                  {/* Sliding brass-gold pill indicator */}
                  <AnimatedView
                    style={[
                      st.switcherPill,
                      { width: PILL_WIDTH },
                      rolePillStyle,
                    ]}
                  />

                  {/* Student Button */}
                  <Pressable
                    style={st.switcherButton}
                    onPress={() => handleRoleChange('STUDENT')}
                  >
                    <View style={st.switcherButtonInner}>
                      <MaterialCommunityIcons
                        name="school-outline"
                        size={18}
                        color={isStudent ? '#0d1f3c' : 'rgba(240, 236, 228, 0.65)'}
                      />
                      <Text
                        style={[
                          st.switcherLabel,
                          isStudent && st.switcherLabelActive,
                        ]}
                      >
                        Student
                      </Text>
                    </View>
                  </Pressable>

                  {/* Faculty Button */}
                  <Pressable
                    style={st.switcherButton}
                    onPress={() => handleRoleChange('TEACHER')}
                  >
                    <View style={st.switcherButtonInner}>
                      <MaterialCommunityIcons
                        name="briefcase-account-outline"
                        size={18}
                        color={!isStudent ? '#0d1f3c' : 'rgba(240, 236, 228, 0.65)'}
                      />
                      <Text
                        style={[
                          st.switcherLabel,
                          !isStudent && st.switcherLabelActive,
                        ]}
                      >
                        Faculty
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ELEVATED FORM CARD                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <View style={st.cardContainer}>
              {/* Tab Navigation */}
              <View style={st.tabBarContainer}>
                <TouchableOpacity
                  style={st.tabItem}
                  onPress={() => handleTabChange('LOGIN')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      st.tabItemText,
                      activeTab === 'LOGIN' && st.tabItemTextActive,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={st.tabItem}
                  onPress={() => handleTabChange('SIGNUP')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      st.tabItemText,
                      activeTab === 'SIGNUP' && st.tabItemTextActive,
                    ]}
                  >
                    New Registration
                  </Text>
                </TouchableOpacity>

                {/* Animated active tab underline */}
                <AnimatedView
                  style={[
                    st.tabActiveIndicator,
                    { width: (SCREEN_WIDTH - 48) / 2 },
                    tabIndicatorStyle,
                  ]}
                >
                  <View style={st.tabIndicatorBar} />
                </AnimatedView>
              </View>

              {/* Form Content Area with Staggered Transitions */}
              <AnimatedView style={[st.formBody, formWrapAnimStyle]}>
                {/* System Alerts */}
                {error && (
                  <StaggeredItem index={0} cycle={animationCycle} direction={transitionDirection}>
                    <AlertBanner type="error" message={error} />
                  </StaggeredItem>
                )}
                {successMsg && (
                  <StaggeredItem index={0} cycle={animationCycle} direction={transitionDirection}>
                    <AlertBanner type="success" message={successMsg} />
                  </StaggeredItem>
                )}
                {pendingNotice && (
                  <StaggeredItem index={0} cycle={animationCycle} direction={transitionDirection}>
                    <AlertBanner type="pending" message={pendingNotice} />
                  </StaggeredItem>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* 1. STUDENT LOGIN FORM                               */}
                {/* ═══════════════════════════════════════════════════ */}
                {isStudent && activeTab === 'LOGIN' && (
                  <>
                    <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Enrollment Number"
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="e.g. EN2024001"
                          placeholderTextColor={colors.mutedText}
                          value={sLogin.enrollmentNumber}
                          onChangeText={(v) => setSLogin((p) => ({ ...p, enrollmentNumber: v }))}
                          autoCapitalize="characters"
                          autoCorrect={false}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                        rightHeaderEl={
                          <TouchableOpacity
                            onPress={() => setError('Please contact the College IT Helpdesk for password assistance.')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={st.forgotText}>Forgot?</Text>
                          </TouchableOpacity>
                        }
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showPassword}
                            value={sLogin.password}
                            onChangeText={(v) => setSLogin((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                      <PrimaryButton
                        title="Sign In to Student Portal"
                        onPress={doStudentLogin}
                        loading={loading}
                      />
                    </StaggeredItem>
                  </>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* 2. STUDENT SIGNUP FORM                              */}
                {/* ═══════════════════════════════════════════════════ */}
                {isStudent && activeTab === 'SIGNUP' && (
                  <>
                    <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Full Name"
                        icon={<Ionicons name="person-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="e.g. Rahul Verma"
                          placeholderTextColor={colors.mutedText}
                          value={sSignup.name}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, name: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Academic Programme"
                        icon={<Ionicons name="book-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TouchableOpacity
                          style={st.selectButton}
                          onPress={() => setShowProgramPicker((v) => !v)}
                          activeOpacity={0.7}
                        >
                          <Text style={st.selectButtonText} numberOfLines={1}>
                            {sSignup.program}
                          </Text>
                          <Ionicons
                            name={showProgramPicker ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.textLight}
                          />
                        </TouchableOpacity>

                        {showProgramPicker && (
                          <AnimatedPickerList
                            items={availablePrograms.map((p) => p.name)}
                            selected={sSignup.program}
                            onSelect={(v) => {
                              setSSignup((p) => ({ ...p, program: v }));
                              setShowProgramPicker(false);
                            }}
                          />
                        )}
                      </FormInputField>
                    </StaggeredItem>

                    {/* Academic Year & Semester */}
                    <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                      <View style={st.dualSelectorRow}>
                        <View style={st.dualSelectorCol}>
                          <Text style={st.miniSectionLabel}>YEAR *</Text>
                          <View style={st.chipsGrid}>
                            {[1, 2, 3, 4].map((y) => (
                              <SelectChip
                                key={y}
                                label={`Y${y}`}
                                active={sSignup.year === y}
                                onPress={() => setSSignup((p) => ({ ...p, year: y }))}
                              />
                            ))}
                          </View>
                        </View>

                        <View style={st.dualSelectorCol}>
                          <Text style={st.miniSectionLabel}>SEMESTER *</Text>
                          <View style={st.chipsGrid}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <SelectChip
                                key={s}
                                label={`${s}`}
                                small
                                active={sSignup.semester === s}
                                onPress={() => setSSignup((p) => ({ ...p, semester: s }))}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                    </StaggeredItem>

                    <StaggeredItem index={4} cycle={animationCycle} direction={transitionDirection}>
                      <SectionRule label="CREDENTIALS" />
                    </StaggeredItem>

                    <StaggeredItem index={5} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="College Email"
                        icon={<Ionicons name="mail-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="student@tribhuvancollege.ac.in"
                          placeholderTextColor={colors.mutedText}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={sSignup.email}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, email: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={6} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Enrollment Number (Login ID)"
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={16} color={colors.gold} />}
                        highlight
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="e.g. EN2024001"
                          placeholderTextColor={colors.mutedText}
                          autoCapitalize="characters"
                          value={sSignup.enrollmentNumber}
                          onChangeText={(v) => setSSignup((p) => ({ ...p, enrollmentNumber: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={7} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showPassword}
                            value={sSignup.password}
                            onChangeText={(v) => setSSignup((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={8} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Confirm Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showConfirmPassword}
                            value={sSignup.confirmPassword}
                            onChangeText={(v) => setSSignup((p) => ({ ...p, confirmPassword: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword((v) => !v)}
                            style={st.eyeButton}
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={9} cycle={animationCycle} direction={transitionDirection}>
                      <PrimaryButton
                        title="Create Student Account"
                        onPress={doStudentSignup}
                        loading={loading}
                      />
                    </StaggeredItem>
                  </>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* 3. TEACHER LOGIN FORM                               */}
                {/* ═══════════════════════════════════════════════════ */}
                {!isStudent && activeTab === 'LOGIN' && (
                  <>
                    <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Institutional Email"
                        icon={<Ionicons name="mail-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="professor@tribhuvancollege.ac.in"
                          placeholderTextColor={colors.mutedText}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={tLogin.email}
                          onChangeText={(v) => setTLogin((p) => ({ ...p, email: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                        rightHeaderEl={
                          <TouchableOpacity
                            onPress={() => setError('Faculty password reset requires administrator assistance.')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={st.forgotText}>Forgot?</Text>
                          </TouchableOpacity>
                        }
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showPassword}
                            value={tLogin.password}
                            onChangeText={(v) => setTLogin((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                      <PrimaryButton
                        title="Sign In to Faculty Portal"
                        onPress={doTeacherLogin}
                        loading={loading}
                      />
                    </StaggeredItem>
                  </>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* 4. TEACHER SIGNUP FORM                              */}
                {/* ═══════════════════════════════════════════════════ */}
                {!isStudent && activeTab === 'SIGNUP' && (
                  <>
                    <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                      <AlertBanner
                        type="pending"
                        message="Faculty registrations are subject to manual administrator review before access is enabled."
                      />
                    </StaggeredItem>

                    <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Full Name"
                        icon={<Ionicons name="person-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="e.g. Prof. Anil Kumar"
                          placeholderTextColor={colors.mutedText}
                          value={tSignup.name}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, name: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="College Email (Login ID)"
                        icon={<Ionicons name="mail-outline" size={16} color={colors.gold} />}
                        highlight
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="teacher@tribhuvancollege.ac.in"
                          placeholderTextColor={colors.mutedText}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={tSignup.email}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, email: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={4} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Employee ID"
                        icon={<MaterialCommunityIcons name="badge-account-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <TextInput
                          style={st.inputField}
                          placeholder="e.g. TCH-001"
                          placeholderTextColor={colors.mutedText}
                          autoCapitalize="characters"
                          value={tSignup.employeeId}
                          onChangeText={(v) => setTSignup((p) => ({ ...p, employeeId: v }))}
                        />
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={5} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Department"
                        icon={<MaterialCommunityIcons name="domain" size={16} color={colors.textLight} />}
                        required
                      >
                        <TouchableOpacity
                          style={st.selectButton}
                          onPress={() => setShowDeptPicker((v) => !v)}
                          activeOpacity={0.7}
                        >
                          <Text style={st.selectButtonText}>{tSignup.department}</Text>
                          <Ionicons
                            name={showDeptPicker ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.textLight}
                          />
                        </TouchableOpacity>

                        {showDeptPicker && (
                          <AnimatedPickerList
                            items={DEPARTMENTS}
                            selected={tSignup.department}
                            onSelect={(v) => {
                              setTSignup((p) => ({ ...p, department: v }));
                              setShowDeptPicker(false);
                            }}
                          />
                        )}
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={6} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showPassword}
                            value={tSignup.password}
                            onChangeText={(v) => setTSignup((p) => ({ ...p, password: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword((v) => !v)}
                            style={st.eyeButton}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={7} cycle={animationCycle} direction={transitionDirection}>
                      <FormInputField
                        label="Confirm Password"
                        icon={<Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />}
                        required
                      >
                        <View style={st.passwordInputRow}>
                          <TextInput
                            style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                            placeholder="••••••••"
                            placeholderTextColor={colors.mutedText}
                            secureTextEntry={!showConfirmPassword}
                            value={tSignup.confirmPassword}
                            onChangeText={(v) => setTSignup((p) => ({ ...p, confirmPassword: v }))}
                          />
                          <TouchableOpacity
                            onPress={() => setShowConfirmPassword((v) => !v)}
                            style={st.eyeButton}
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={colors.mutedText}
                            />
                          </TouchableOpacity>
                        </View>
                      </FormInputField>
                    </StaggeredItem>

                    <StaggeredItem index={8} cycle={animationCycle} direction={transitionDirection}>
                      <PrimaryButton
                        title="Submit Faculty Application"
                        onPress={doTeacherSignup}
                        loading={loading}
                      />
                    </StaggeredItem>
                  </>
                )}
              </AnimatedView>

              {/* Institutional Footer */}
              <View style={st.footerArea}>
                <View style={st.footerShieldRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.mutedText} />
                  <Text style={st.footerSecurityText}>256-Bit Encrypted Academic Network</Text>
                </View>
                <Text style={st.footerCopyright}>
                  © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * StaggeredItem renders a child element with spring-eased entry and horizontal directional slide
 */
function StaggeredItem({
  index,
  cycle,
  direction,
  children,
}: {
  index: number;
  cycle: number;
  direction: 'toRight' | 'toLeft';
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const opacity = useSharedValue(prefersReducedMotion ? 1 : 0);
  const translateY = useSharedValue(prefersReducedMotion ? 0 : 16);
  const translateX = useSharedValue(
    prefersReducedMotion ? 0 : direction === 'toRight' ? 14 : -14
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      translateX.value = 0;
      return;
    }

    const delayMs = index * 35;
    opacity.value = 0;
    translateY.value = 14;
    translateX.value = direction === 'toRight' ? 12 : -12;

    opacity.value = withDelay(delayMs, withTiming(1, { duration: 240 }));
    translateY.value = withDelay(
      delayMs,
      withSpring(0, { damping: 16, stiffness: 160 })
    );
    translateX.value = withDelay(
      delayMs,
      withSpring(0, { damping: 16, stiffness: 160 })
    );
  }, [cycle, index, direction, prefersReducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return <AnimatedView style={[st.staggeredWrap, animStyle]}>{children}</AnimatedView>;
}

function FormInputField({
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
    <View style={st.fieldGroup}>
      <View style={st.fieldHeaderRow}>
        <View style={st.fieldLabelLeft}>
          {icon && <View style={st.fieldIconWrap}>{icon}</View>}
          <Text style={[st.fieldLabelText, highlight && st.fieldLabelTextHighlight]}>
            {label}
            {required && <Text style={st.asterisk}> *</Text>}
          </Text>
        </View>
        {rightHeaderEl}
      </View>
      <View style={[st.fieldContainer, highlight && st.fieldContainerHighlight]}>
        {children}
      </View>
    </View>
  );
}

function PrimaryButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 150 });
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={[st.buttonWrap, buttonAnimStyle]}>
      <TouchableOpacity
        style={st.primaryButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <View style={st.buttonInner}>
            <Text style={st.primaryButtonText}>{title}</Text>
            <View style={st.buttonArrowCircle}>
              <Ionicons name="arrow-forward" size={14} color="#0d1f3c" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </AnimatedView>
  );
}

function SelectChip({
  label,
  active,
  onPress,
  small,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  small?: boolean;
}) {
  const chipScale = useSharedValue(1);

  const handlePress = () => {
    chipScale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 180 })
    );
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chipScale.value }],
  }));

  return (
    <AnimatedView style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          st.chipBase,
          small && st.chipSmall,
          active && st.chipActive,
        ]}
      >
        <Text
          style={[
            st.chipLabel,
            small && st.chipLabelSmall,
            active && st.chipLabelActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </AnimatedView>
  );
}

function AnimatedPickerList({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <View style={st.pickerDropdownContainer}>
      {items.map((item) => {
        const isSel = item === selected;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            style={[st.pickerRow, isSel && st.pickerRowActive]}
            activeOpacity={0.7}
          >
            <Text style={[st.pickerRowText, isSel && st.pickerRowTextActive]} numberOfLines={1}>
              {item}
            </Text>
            {isSel && <Ionicons name="checkmark" size={14} color={colors.gold} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SectionRule({ label }: { label: string }) {
  return (
    <View style={st.sectionRuleRow}>
      <View style={st.sectionRuleLine} />
      <Text style={st.sectionRuleText}>{label}</Text>
      <View style={st.sectionRuleLine} />
    </View>
  );
}

function AlertBanner({
  type,
  message,
}: {
  type: 'error' | 'success' | 'pending';
  message: string;
}) {
  const config = {
    error: {
      bg: '#fdf2f2',
      border: '#c04040',
      text: '#7a2020',
      icon: <Ionicons name="alert-circle-outline" size={16} color="#c04040" />,
      title: 'Authentication Error',
    },
    success: {
      bg: '#f0f7f0',
      border: '#2d7a2d',
      text: '#2d5a2d',
      icon: <Ionicons name="checkmark-circle-outline" size={16} color="#2d7a2d" />,
      title: 'Success',
    },
    pending: {
      bg: '#fdf8ed',
      border: '#c8922a',
      text: '#6a5420',
      icon: <Ionicons name="time-outline" size={16} color="#c8922a" />,
      title: 'Approval Pending',
    },
  }[type];

  return (
    <View style={[st.alertBox, { backgroundColor: config.bg, borderLeftColor: config.border }]}>
      <View style={st.alertIconCol}>{config.icon}</View>
      <View style={st.alertContentCol}>
        <Text style={[st.alertTitle, { color: config.border }]}>{config.title}</Text>
        <Text style={[st.alertMessage, { color: config.text }]}>{message}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#091529',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#091529',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f0ece4',
  },

  // ── HEADER ──
  headerContainer: {
    backgroundColor: '#091529',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 146, 42, 0.15)',
  },
  topAccentBar: {
    flexDirection: 'row',
    width: '100%',
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  accentNavy: {
    flex: 1,
    backgroundColor: '#0d1f3c',
  },
  accentGold: {
    width: 60,
    backgroundColor: '#c8922a',
  },

  crestOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(200, 146, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 146, 42, 0.08)',
    marginBottom: 14,
    position: 'relative',
  },
  crestMidRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#c8922a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d1f3c',
    shadowColor: '#c8922a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  crestCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealDotTop: {
    position: 'absolute',
    top: -3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#c8922a',
  },
  sealDotBottom: {
    position: 'absolute',
    bottom: -3,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#c8922a',
  },

  collegeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f0ece4',
    textAlign: 'center',
    letterSpacing: 0.6,
    lineHeight: 24,
    marginBottom: 8,
  },

  diamondDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  diamondLine: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(200, 146, 42, 0.4)',
  },
  diamondShape: {
    width: 4,
    height: 4,
    backgroundColor: '#c8922a',
    transform: [{ rotate: '45deg' }],
  },
  portalTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c8922a',
    letterSpacing: 3,
  },

  headerSubtitle: {
    fontSize: 11.5,
    color: 'rgba(240, 236, 228, 0.65)',
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: 'center',
  },

  // ── ROLE SWITCHER ──
  switcherContainer: {
    marginTop: 4,
  },
  switcherTrack: {
    flexDirection: 'row',
    backgroundColor: '#0d1f3c',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 146, 42, 0.35)',
    position: 'relative',
  },
  switcherPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 10,
    backgroundColor: '#c8922a',
  },
  switcherButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switcherButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switcherLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(240, 236, 228, 0.7)',
    letterSpacing: 0.4,
  },
  switcherLabelActive: {
    color: '#0d1f3c',
    fontWeight: '800',
  },

  // ── CARD ──
  cardContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(212, 201, 176, 0.6)',
    marginTop: -8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    minHeight: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },

  tabBarContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e2d6',
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tabItemTextActive: {
    color: '#0d1f3c',
    fontWeight: '800',
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicatorBar: {
    width: '45%',
    height: '100%',
    backgroundColor: '#c8922a',
    borderRadius: 2,
  },

  // ── FORM ELEMENTS ──
  formBody: {
    width: '100%',
  },
  staggeredWrap: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  fieldLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIconWrap: {
    marginRight: 6,
  },
  fieldLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldLabelTextHighlight: {
    color: '#b5872a',
  },
  asterisk: {
    color: '#c8922a',
    fontWeight: '800',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c8922a',
    letterSpacing: 0.2,
  },

  fieldContainer: {
    backgroundColor: '#f7f5f0',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 201, 176, 0.6)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  fieldContainerHighlight: {
    borderColor: '#c8922a',
    backgroundColor: '#fcfaf5',
  },
  inputField: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    color: colors.textDark,
    fontWeight: '500',
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectButtonText: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  pickerDropdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e8e2d6',
    backgroundColor: '#ffffff',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f5f0',
  },
  pickerRowActive: {
    backgroundColor: '#fcf8ee',
  },
  pickerRowText: {
    fontSize: 12.5,
    color: colors.textLight,
    flex: 1,
    marginRight: 8,
  },
  pickerRowTextActive: {
    color: '#0d1f3c',
    fontWeight: '700',
  },

  // ── DUAL SELECTOR (YEAR / SEMESTER) ──
  dualSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  dualSelectorCol: {
    flex: 1,
  },
  miniSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chipBase: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 201, 176, 0.6)',
    backgroundColor: '#f7f5f0',
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#0d1f3c',
    borderColor: '#0d1f3c',
  },
  chipLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textLight,
  },
  chipLabelSmall: {
    fontSize: 11,
  },
  chipLabelActive: {
    color: '#f0ece4',
  },

  // ── SECTION BREAK ──
  sectionRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  sectionRuleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e2d6',
  },
  sectionRuleText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.mutedText,
    letterSpacing: 2,
  },

  // ── BUTTON ──
  buttonWrap: {
    marginTop: 18,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#0d1f3c',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d1f3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 42, 0.4)',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#f0ece4',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c8922a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── ALERTS ──
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  alertIconCol: {
    marginRight: 10,
    marginTop: 1,
  },
  alertContentCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ── FOOTER ──
  footerArea: {
    alignItems: 'center',
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f0ece4',
  },
  footerShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  footerSecurityText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.mutedText,
    letterSpacing: 0.3,
  },
  footerCopyright: {
    fontSize: 10,
    color: colors.mutedText,
    letterSpacing: 0.2,
  },
});
