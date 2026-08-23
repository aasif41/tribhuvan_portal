import React, { useState, useEffect, useRef } from 'react';
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
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { BlurView as ExpoBlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const LinearGradient = ExpoLinearGradient as any;
const BlurView = ExpoBlurView as any;
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
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

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Environmental Sciences',
  'Information Technology',
  'Basic Sciences & Humanities',
  'Management & Business Studies',
  'Civil & Environmental Engineering',
];

// Tuned physical spring configurations
const SPRING_SNAPPY = {
  damping: 16,
  stiffness: 180,
  mass: 0.8,
};

const SPRING_BOUNCE = {
  damping: 12,
  stiffness: 150,
  mass: 0.75,
};

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // ── Form & UI States ──
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

  // Stagger cycle token for re-triggering entrance transitions
  const [animationCycle, setAnimationCycle] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'toRight' | 'toLeft'>('toLeft');

  // ── Ambient Background Glow Shared Values ──
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb1Opacity = useSharedValue(0.28);

  const orb2X = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const orb2Opacity = useSharedValue(0.35);

  const orb3Scale = useSharedValue(1);

  // ── UI Micro-Motion Shared Values ──
  const roleToggleX = useSharedValue(0);
  const roleSquashX = useSharedValue(1);
  const roleSquashY = useSharedValue(1);
  const roleIconRotate = useSharedValue(0);

  const tabToggleX = useSharedValue(0);
  const sealScale = useSharedValue(1);
  const sealRotate = useSharedValue(0);
  const formOpacity = useSharedValue(1);

  // ── Ambient Background Orb Animations ──
  useEffect(() => {
    if (prefersReducedMotion) return;

    // Gold/Amber Orb 1 looping drift
    orb1X.value = withRepeat(
      withSequence(
        withTiming(45, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-30, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(-35, { duration: 8500, easing: Easing.inOut(Easing.sin) }),
        withTiming(40, { duration: 10500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 9000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.42, { duration: 6000 }),
        withTiming(0.22, { duration: 7000 })
      ),
      -1,
      true
    );

    // Sapphire/Navy Orb 2 looping drift
    orb2X.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        withTiming(35, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 9500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 9500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-45, { duration: 11500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 8500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    orb2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 7500 }),
        withTiming(0.32, { duration: 8500 })
      ),
      -1,
      true
    );

    // Jewel Teal Orb 3 subtle pulse
    orb3Scale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 7000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [prefersReducedMotion]);

  // Fetch dynamic programs
  useEffect(() => {
    api.get('/programs')
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailablePrograms(res.data.data);
        }
      })
      .catch(() => {
        // Fallback gracefully to default shared list
      });
  }, []);

  // ── Role Switch Handler with Elastic Squash/Stretch & Haptics ──
  const handleRoleChange = (newRole: RoleType) => {
    if (newRole === role) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback gracefully
    }

    const isTargetTeacher = newRole === 'TEACHER';
    setTransitionDirection(isTargetTeacher ? 'toRight' : 'toLeft');

    if (!prefersReducedMotion) {
      // 1. Elastic squash-and-stretch on the pill shape during motion
      roleSquashX.value = withSequence(
        withTiming(1.16, { duration: 110, easing: Easing.out(Easing.quad) }),
        withSpring(1, SPRING_SNAPPY)
      );
      roleSquashY.value = withSequence(
        withTiming(0.92, { duration: 110, easing: Easing.out(Easing.quad) }),
        withSpring(1, SPRING_SNAPPY)
      );

      roleToggleX.value = withSpring(isTargetTeacher ? 1 : 0, SPRING_SNAPPY);
      roleIconRotate.value = withSequence(
        withTiming(isTargetTeacher ? 15 : -15, { duration: 130 }),
        withSpring(0, SPRING_BOUNCE)
      );

      // 2. Coordinated Seal Glow & Pulse
      sealScale.value = withSequence(
        withTiming(1.12, { duration: 140 }),
        withSpring(1, SPRING_BOUNCE)
      );
      sealRotate.value = withSequence(
        withTiming(isTargetTeacher ? 10 : -10, { duration: 140 }),
        withSpring(0, SPRING_BOUNCE)
      );

      // 3. Smooth Form Cross-Fade
      formOpacity.value = withSequence(
        withTiming(0.15, { duration: 90 }),
        withTiming(1, { duration: 220 })
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

  // ── Tab Switch Handler with Haptics ──
  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }

    const isSignup = newTab === 'SIGNUP';
    setTransitionDirection(isSignup ? 'toRight' : 'toLeft');

    if (!prefersReducedMotion) {
      tabToggleX.value = withSpring(isSignup ? 1 : 0, SPRING_SNAPPY);
      formOpacity.value = withSequence(
        withTiming(0.15, { duration: 90 }),
        withTiming(1, { duration: 200 })
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

  // ── Form Input States ──
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

  // ── Auth Actions ──
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
  const SWITCHER_PADDING = 4;
  const SWITCHER_WIDTH = SCREEN_WIDTH - 44;
  const PILL_WIDTH = (SWITCHER_WIDTH - SWITCHER_PADDING * 2) / 2;

  // ── Animated Background Glow Styles ──
  const orb1AnimStyle = useAnimatedStyle(() => ({
    opacity: orb1Opacity.value,
    transform: [
      { translateX: orb1X.value },
      { translateY: orb1Y.value },
    ],
  }));

  const orb2AnimStyle = useAnimatedStyle(() => ({
    opacity: orb2Opacity.value,
    transform: [
      { translateX: orb2X.value },
      { translateY: orb2Y.value },
    ],
  }));

  const orb3AnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orb3Scale.value }],
  }));

  // ── Animated UI Element Styles ──
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
        { scaleX: roleSquashX.value },
        { scaleY: roleSquashY.value },
      ],
    };
  });

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (SCREEN_WIDTH - 44) / 2;
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
      <StatusBar barStyle="light-content" backgroundColor="#050e1d" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. ANIMATED DEPTH AMBIENT BACKGROUND MESH LAYER            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Base dark canvas gradient */}
        <LinearGradient
          colors={['#061022', '#09162e', '#050e1d']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Floating Drifting Orb 1: Warm Brass-Gold Glow (Top Right) */}
        <AnimatedView style={[st.ambientOrb1, orb1AnimStyle]}>
          <LinearGradient
            colors={['rgba(200, 146, 42, 0.45)', 'rgba(200, 146, 42, 0.0)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </AnimatedView>

        {/* Floating Drifting Orb 2: Deep Midnight Sapphire Glow (Mid Left) */}
        <AnimatedView style={[st.ambientOrb2, orb2AnimStyle]}>
          <LinearGradient
            colors={['rgba(30, 64, 175, 0.55)', 'rgba(30, 64, 175, 0.0)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </AnimatedView>

        {/* Floating Drifting Orb 3: Subtle Jewel Emerald Accent (Bottom Center) */}
        <AnimatedView style={[st.ambientOrb3, orb3AnimStyle]}>
          <LinearGradient
            colors={['rgba(13, 148, 136, 0.25)', 'rgba(13, 148, 136, 0.0)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </AnimatedView>

        {/* Fine Starburst / Grid Watermark */}
        <View style={st.watermarkRings}>
          <View style={st.watermarkRingOuter} />
          <View style={st.watermarkRingInner} />
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. MAIN SCROLLABLE CONTENT WITH FROSTED GLASS CARDS         */}
      {/* ═══════════════════════════════════════════════════════════ */}
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
            {/* ─── INSTITUTIONAL HERO HEADER ─── */}
            <View style={st.headerContainer}>
              {/* Top Jewel Hairline */}
              <View style={st.topAccentBar}>
                <View style={st.accentNavy} />
                <LinearGradient
                  colors={['#dfa943', '#c8922a', '#9a6b18']}
                  style={st.accentGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={st.accentNavy} />
              </View>

              {/* Concentric Crest Emblem with Dual Gold Rings */}
              <AnimatedView style={[st.crestOuterRing, sealAnimStyle]}>
                <LinearGradient
                  colors={['rgba(200, 146, 42, 0.25)', 'rgba(200, 146, 42, 0.05)']}
                  style={st.crestGlowBackdrop}
                />
                <View style={st.crestMidRing}>
                  <LinearGradient
                    colors={['#172a4d', '#0d1f3c']}
                    style={st.crestCore}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isStudent ? (
                      <MaterialCommunityIcons name="school" size={28} color="#dfa943" />
                    ) : (
                      <MaterialCommunityIcons name="account-tie" size={28} color="#dfa943" />
                    )}
                  </LinearGradient>
                </View>
                {/* Micro compass diamonds */}
                <View style={st.sealDotTop} />
                <View style={st.sealDotBottom} />
                <View style={st.sealDotLeft} />
                <View style={st.sealDotRight} />
              </AnimatedView>

              {/* College Title Wordmark */}
              <Text style={st.collegeTitle}>{COLLEGE.name}</Text>

              {/* Fine Diamond Academic Divider */}
              <View style={st.diamondDivider}>
                <LinearGradient
                  colors={['transparent', 'rgba(200, 146, 42, 0.6)']}
                  style={st.diamondLine}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <View style={st.diamondShape} />
                <Text style={st.portalTag}>INSTITUTIONAL GATEWAY</Text>
                <View style={st.diamondShape} />
                <LinearGradient
                  colors={['rgba(200, 146, 42, 0.6)', 'transparent']}
                  style={st.diamondLine}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>

              <Text style={st.headerSubtitle}>
                {isStudent
                  ? 'Student Academic & Examination Portal'
                  : 'Faculty & Departmental Management System'}
              </Text>

              {/* ─── TACTILE NEUMORPHIC ROLE TOGGLE (STUDENT / FACULTY) ─── */}
              <View style={[st.switcherContainer, { width: SWITCHER_WIDTH }]}>
                {/* Subtle outer glow on container */}
                <View style={st.switcherTrack}>
                  {/* Sliding Elastic Spring Pill */}
                  <AnimatedView
                    style={[
                      st.switcherPill,
                      { width: PILL_WIDTH },
                      rolePillStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={['#dfa943', '#c8922a', '#a8741e']}
                      style={st.switcherPillGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {/* Top highlight line for 3D metallic feel */}
                      <View style={st.switcherPillHighlight} />
                    </LinearGradient>
                  </AnimatedView>

                  {/* Student Segment Button */}
                  <Pressable
                    style={st.switcherButton}
                    onPress={() => handleRoleChange('STUDENT')}
                  >
                    <View style={st.switcherButtonInner}>
                      <MaterialCommunityIcons
                        name="school-outline"
                        size={18}
                        color={isStudent ? '#091529' : 'rgba(240, 236, 228, 0.7)'}
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

                  {/* Faculty Segment Button */}
                  <Pressable
                    style={st.switcherButton}
                    onPress={() => handleRoleChange('TEACHER')}
                  >
                    <View style={st.switcherButtonInner}>
                      <MaterialCommunityIcons
                        name="briefcase-account-outline"
                        size={18}
                        color={!isStudent ? '#091529' : 'rgba(240, 236, 228, 0.7)'}
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

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 3. FROSTED GLASS FLOATING CARD WITH INNER GRADIENT BORDER   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <View style={st.glassCardWrapper}>
              {/* Outer Card Gradient Border Container */}
              <LinearGradient
                colors={['rgba(200, 146, 42, 0.45)', 'rgba(255, 255, 255, 0.12)', 'rgba(13, 31, 60, 0.5)']}
                style={st.cardBorderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Frosted Glass Background */}
                <BlurView intensity={Platform.OS === 'ios' ? 45 : 90} tint="dark" style={st.cardBlur}>
                  <View style={st.cardContentInner}>
                    {/* Tab Navigation: Sign In / New Registration */}
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

                      {/* Animated Gold Tab Underline */}
                      <AnimatedView
                        style={[
                          st.tabActiveIndicator,
                          { width: (SCREEN_WIDTH - 44) / 2 },
                          tabIndicatorStyle,
                        ]}
                      >
                        <LinearGradient
                          colors={['#dfa943', '#c8922a']}
                          style={st.tabIndicatorBar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </AnimatedView>
                    </View>

                    {/* ─── STAGGERED FORM TRANSITIONS ─── */}
                    <AnimatedView style={[st.formBody, formWrapAnimStyle]}>
                      {/* Status & Feedback Alerts */}
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

                      {/* ═════════════════════════════════════════════ */}
                      {/* 1. STUDENT LOGIN FORM                         */}
                      {/* ═════════════════════════════════════════════ */}
                      {isStudent && activeTab === 'LOGIN' && (
                        <>
                          <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Enrollment Number"
                              icon={<MaterialCommunityIcons name="card-account-details-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="e.g. EN2024001"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                value={sLogin.enrollmentNumber}
                                onChangeText={(v) => setSLogin((p) => ({ ...p, enrollmentNumber: v }))}
                                autoCapitalize="characters"
                                autoCorrect={false}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
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
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                            <TactilePrimaryButton
                              title="Sign In to Student Portal"
                              onPress={doStudentLogin}
                              loading={loading}
                            />
                          </StaggeredItem>
                        </>
                      )}

                      {/* ═════════════════════════════════════════════ */}
                      {/* 2. STUDENT SIGNUP FORM                        */}
                      {/* ═════════════════════════════════════════════ */}
                      {isStudent && activeTab === 'SIGNUP' && (
                        <>
                          <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Full Name"
                              icon={<Ionicons name="person-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="e.g. Rahul Verma"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                value={sSignup.name}
                                onChangeText={(v) => setSSignup((p) => ({ ...p, name: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Academic Programme"
                              icon={<Ionicons name="book-outline" size={17} color="#a6b7d4" />}
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
                                  color="#dfa943"
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
                            </GlassInputField>
                          </StaggeredItem>

                          {/* Year & Semester Grid */}
                          <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                            <View style={st.dualSelectorRow}>
                              <View style={st.dualSelectorCol}>
                                <Text style={st.miniSectionLabel}>YEAR *</Text>
                                <View style={st.chipsGrid}>
                                  {[1, 2, 3, 4].map((y) => (
                                    <TactileChip
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
                                    <TactileChip
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
                            <SectionDividerRule label="AUTHENTICATION CREDENTIALS" />
                          </StaggeredItem>

                          <StaggeredItem index={5} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="College Email"
                              icon={<Ionicons name="mail-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="student@tribhuvancollege.ac.in"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={sSignup.email}
                                onChangeText={(v) => setSSignup((p) => ({ ...p, email: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={6} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Enrollment Number (Login ID)"
                              icon={<MaterialCommunityIcons name="card-account-details-outline" size={17} color="#dfa943" />}
                              highlight
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="e.g. EN2024001"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                autoCapitalize="characters"
                                value={sSignup.enrollmentNumber}
                                onChangeText={(v) => setSSignup((p) => ({ ...p, enrollmentNumber: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={7} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <View style={st.passwordInputRow}>
                                <TextInput
                                  style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                                  placeholder="••••••••"
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={8} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Confirm Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <View style={st.passwordInputRow}>
                                <TextInput
                                  style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                                  placeholder="••••••••"
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={9} cycle={animationCycle} direction={transitionDirection}>
                            <TactilePrimaryButton
                              title="Create Student Account"
                              onPress={doStudentSignup}
                              loading={loading}
                            />
                          </StaggeredItem>
                        </>
                      )}

                      {/* ═════════════════════════════════════════════ */}
                      {/* 3. TEACHER LOGIN FORM                         */}
                      {/* ═════════════════════════════════════════════ */}
                      {!isStudent && activeTab === 'LOGIN' && (
                        <>
                          <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Institutional Email"
                              icon={<Ionicons name="mail-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="professor@tribhuvancollege.ac.in"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={tLogin.email}
                                onChangeText={(v) => setTLogin((p) => ({ ...p, email: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
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
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                            <TactilePrimaryButton
                              title="Sign In to Faculty Portal"
                              onPress={doTeacherLogin}
                              loading={loading}
                            />
                          </StaggeredItem>
                        </>
                      )}

                      {/* ═════════════════════════════════════════════ */}
                      {/* 4. TEACHER SIGNUP FORM                        */}
                      {/* ═════════════════════════════════════════════ */}
                      {!isStudent && activeTab === 'SIGNUP' && (
                        <>
                          <StaggeredItem index={1} cycle={animationCycle} direction={transitionDirection}>
                            <AlertBanner
                              type="pending"
                              message="Faculty registrations are subject to manual administrator review before access is enabled."
                            />
                          </StaggeredItem>

                          <StaggeredItem index={2} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Full Name"
                              icon={<Ionicons name="person-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="e.g. Prof. Anil Kumar"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                value={tSignup.name}
                                onChangeText={(v) => setTSignup((p) => ({ ...p, name: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={3} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="College Email (Login ID)"
                              icon={<Ionicons name="mail-outline" size={17} color="#dfa943" />}
                              highlight
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="teacher@tribhuvancollege.ac.in"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={tSignup.email}
                                onChangeText={(v) => setTSignup((p) => ({ ...p, email: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={4} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Employee ID"
                              icon={<MaterialCommunityIcons name="badge-account-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <TextInput
                                style={st.inputField}
                                placeholder="e.g. TCH-001"
                                placeholderTextColor="rgba(166, 183, 212, 0.45)"
                                autoCapitalize="characters"
                                value={tSignup.employeeId}
                                onChangeText={(v) => setTSignup((p) => ({ ...p, employeeId: v }))}
                              />
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={5} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Department"
                              icon={<MaterialCommunityIcons name="domain" size={17} color="#a6b7d4" />}
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
                                  color="#dfa943"
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
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={6} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <View style={st.passwordInputRow}>
                                <TextInput
                                  style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                                  placeholder="••••••••"
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={7} cycle={animationCycle} direction={transitionDirection}>
                            <GlassInputField
                              label="Confirm Password"
                              icon={<Ionicons name="lock-closed-outline" size={17} color="#a6b7d4" />}
                              required
                            >
                              <View style={st.passwordInputRow}>
                                <TextInput
                                  style={[st.inputField, { flex: 1, borderWidth: 0 }]}
                                  placeholder="••••••••"
                                  placeholderTextColor="rgba(166, 183, 212, 0.45)"
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
                                    color="#a6b7d4"
                                  />
                                </TouchableOpacity>
                              </View>
                            </GlassInputField>
                          </StaggeredItem>

                          <StaggeredItem index={8} cycle={animationCycle} direction={transitionDirection}>
                            <TactilePrimaryButton
                              title="Submit Faculty Application"
                              onPress={doTeacherSignup}
                              loading={loading}
                            />
                          </StaggeredItem>
                        </>
                      )}
                    </AnimatedView>

                    {/* ─── INSTITUTIONAL SECURITY FOOTER ─── */}
                    <View style={st.footerArea}>
                      <View style={st.footerShieldRow}>
                        <Ionicons name="shield-checkmark" size={14} color="#dfa943" />
                        <Text style={st.footerSecurityText}>256-Bit Encrypted Academic Network</Text>
                      </View>
                      <Text style={st.footerCopyright}>
                        © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
                      </Text>
                    </View>
                  </View>
                </BlurView>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED SUB-COMPONENTS & ATOMS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * StaggeredItem renders a child element with spring-eased entry and directional slide
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

    const delayMs = index * 32;
    opacity.value = 0;
    translateY.value = 14;
    translateX.value = direction === 'toRight' ? 12 : -12;

    opacity.value = withDelay(delayMs, withTiming(1, { duration: 220 }));
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

/**
 * GlassInputField provides active glowing border and frosted background for input fields
 */
function GlassInputField({
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

/**
 * TactilePrimaryButton renders a 3D gold gradient submit button with press-scale feedback
 */
function TactilePrimaryButton({
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    scale.value = withSpring(0.96, { damping: 14, stiffness: 220 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 160 });
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={[st.buttonWrap, buttonAnimStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.92}
        disabled={loading}
      >
        <LinearGradient
          colors={['#dfa943', '#c8922a', '#9a6b18']}
          style={st.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top Specular Edge Highlight */}
          <View style={st.buttonSpecularLine} />

          {loading ? (
            <ActivityIndicator color="#091529" size="small" />
          ) : (
            <View style={st.buttonInner}>
              <Text style={st.primaryButtonText}>{title}</Text>
              <View style={st.buttonArrowCircle}>
                <Ionicons name="arrow-forward" size={14} color="#dfa943" />
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedView>
  );
}

/**
 * TactileChip renders animated select buttons with spring bounce
 */
function TactileChip({
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    chipScale.value = withSequence(
      withTiming(0.88, { duration: 70 }),
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
        {active ? (
          <LinearGradient
            colors={['#dfa943', '#c8922a']}
            style={st.chipActiveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[st.chipLabel, small && st.chipLabelSmall, st.chipLabelActive]}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <Text style={[st.chipLabel, small && st.chipLabelSmall]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </AnimatedView>
  );
}

/**
 * AnimatedPickerList renders dropdown option items
 */
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
            {isSel && <Ionicons name="checkmark-circle" size={16} color="#dfa943" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * SectionDividerRule renders a delicate horizontal rule
 */
function SectionDividerRule({ label }: { label: string }) {
  return (
    <View style={st.sectionRuleRow}>
      <LinearGradient
        colors={['transparent', 'rgba(200, 146, 42, 0.35)']}
        style={st.sectionRuleLine}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <Text style={st.sectionRuleText}>{label}</Text>
      <LinearGradient
        colors={['rgba(200, 146, 42, 0.35)', 'transparent']}
        style={st.sectionRuleLine}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
}

/**
 * AlertBanner renders feedback messages with distinct styling
 */
function AlertBanner({
  type,
  message,
}: {
  type: 'error' | 'success' | 'pending';
  message: string;
}) {
  const config = {
    error: {
      bg: 'rgba(90, 24, 24, 0.35)',
      border: '#e05252',
      text: '#ffd5d5',
      icon: <Ionicons name="alert-circle-outline" size={18} color="#e05252" />,
      title: 'Authentication Notice',
    },
    success: {
      bg: 'rgba(20, 70, 35, 0.35)',
      border: '#34d399',
      text: '#d1fae5',
      icon: <Ionicons name="checkmark-circle-outline" size={18} color="#34d399" />,
      title: 'Success',
    },
    pending: {
      bg: 'rgba(90, 65, 15, 0.35)',
      border: '#dfa943',
      text: '#fef3c7',
      icon: <Ionicons name="time-outline" size={18} color="#dfa943" />,
      title: 'Approval Pending',
    },
  }[type];

  return (
    <View style={[st.alertBox, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={st.alertIconCol}>{config.icon}</View>
      <View style={st.alertContentCol}>
        <Text style={[st.alertTitle, { color: config.border }]}>{config.title}</Text>
        <Text style={[st.alertMessage, { color: config.text }]}>{message}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ULTRA-PREMIUM DESIGN SYSTEM STYLES
// ═══════════════════════════════════════════════════════════════════════════
const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050e1d',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ── AMBIENT DRIFTING GLOW ORBS ──
  ambientOrb1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  ambientOrb2: {
    position: 'absolute',
    top: 260,
    left: -70,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  ambientOrb3: {
    position: 'absolute',
    bottom: 50,
    right: -20,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  watermarkRings: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 380,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.04,
  },
  watermarkRingOuter: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    borderColor: '#c8922a',
  },
  watermarkRingInner: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: '#c8922a',
  },

  // ── HEADER ──
  headerContainer: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 24,
    paddingHorizontal: 22,
  },
  topAccentBar: {
    flexDirection: 'row',
    width: '100%',
    height: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  accentNavy: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  accentGold: {
    width: 80,
  },

  crestOuterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 146, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#c8922a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  crestGlowBackdrop: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 41,
  },
  crestMidRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#dfa943',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crestCore: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealDotTop: {
    position: 'absolute',
    top: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dfa943',
  },
  sealDotBottom: {
    position: 'absolute',
    bottom: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dfa943',
  },
  sealDotLeft: {
    position: 'absolute',
    left: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dfa943',
  },
  sealDotRight: {
    position: 'absolute',
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dfa943',
  },

  collegeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f8f5ee',
    textAlign: 'center',
    letterSpacing: 0.8,
    lineHeight: 26,
    marginBottom: 8,
  },

  diamondDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  diamondLine: {
    width: 28,
    height: 1,
  },
  diamondShape: {
    width: 4,
    height: 4,
    backgroundColor: '#dfa943',
    transform: [{ rotate: '45deg' }],
  },
  portalTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#dfa943',
    letterSpacing: 2.8,
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(240, 236, 228, 0.65)',
    letterSpacing: 0.3,
    marginBottom: 18,
    textAlign: 'center',
  },

  // ── NEUMORPHIC ROLE SWITCHER ──
  switcherContainer: {
    marginTop: 2,
  },
  switcherTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 17, 34, 0.85)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 42, 0.35)',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  switcherPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#dfa943',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  switcherPillGradient: {
    flex: 1,
    borderRadius: 12,
  },
  switcherPillHighlight: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  switcherButton: {
    flex: 1,
    paddingVertical: 12,
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
    color: '#091529',
    fontWeight: '800',
  },

  // ── GLASSMORPHIC FLOATING CARD ──
  glassCardWrapper: {
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  cardBorderGradient: {
    borderRadius: 26,
    padding: 1,
  },
  cardBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 22, 44, 0.75)',
  },
  cardContentInner: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  // ── TABS ──
  tabBarContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 146, 42, 0.15)',
    marginBottom: 22,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(166, 183, 212, 0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabItemTextActive: {
    color: '#f8f5ee',
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
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(166, 183, 212, 0.85)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldLabelTextHighlight: {
    color: '#dfa943',
  },
  asterisk: {
    color: '#e05252',
    fontWeight: '800',
  },
  forgotText: {
    fontSize: 11.5,
    color: '#dfa943',
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  fieldContainer: {
    backgroundColor: 'rgba(7, 16, 32, 0.75)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 42, 0.22)',
    overflow: 'hidden',
  },
  fieldContainerHighlight: {
    borderColor: 'rgba(223, 169, 67, 0.55)',
    backgroundColor: 'rgba(15, 30, 56, 0.85)',
  },
  inputField: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f8f5ee',
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

  // ── SELECT BUTTON & DROPDOWN ──
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectButtonText: {
    fontSize: 13.5,
    color: '#f8f5ee',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  pickerDropdownContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 146, 42, 0.2)',
    backgroundColor: 'rgba(5, 12, 25, 0.95)',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  pickerRowActive: {
    backgroundColor: 'rgba(200, 146, 42, 0.15)',
  },
  pickerRowText: {
    fontSize: 12.5,
    color: 'rgba(240, 236, 228, 0.75)',
    flex: 1,
    marginRight: 8,
  },
  pickerRowTextActive: {
    color: '#dfa943',
    fontWeight: '700',
  },

  // ── DUAL SELECTOR GRID (YEAR / SEMESTER) ──
  dualSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dualSelectorCol: {
    flex: 1,
  },
  miniSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(166, 183, 212, 0.7)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBase: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(7, 16, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(200, 146, 42, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    overflow: 'hidden',
  },
  chipSmall: {
    minWidth: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: '#dfa943',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  chipActiveGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(240, 236, 228, 0.7)',
  },
  chipLabelSmall: {
    fontSize: 11.5,
  },
  chipLabelActive: {
    color: '#091529',
    fontWeight: '800',
  },

  // ── SECTION DIVIDER ──
  sectionRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  sectionRuleLine: {
    flex: 1,
    height: 1,
  },
  sectionRuleText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#dfa943',
    letterSpacing: 1.8,
  },

  // ── PRIMARY BUTTON ──
  buttonWrap: {
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#dfa943',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#091529',
    letterSpacing: 0.4,
  },
  buttonArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#091529',
    alignItems: 'center',
    justifyContent: 'center',
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
  alertIconCol: {
    marginRight: 10,
    marginTop: 1,
  },
  alertContentCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
  },

  // ── FOOTER ──
  footerArea: {
    marginTop: 22,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 146, 42, 0.15)',
    paddingTop: 16,
  },
  footerShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  footerSecurityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dfa943',
    letterSpacing: 0.3,
  },
  footerCopyright: {
    fontSize: 10,
    color: 'rgba(166, 183, 212, 0.45)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
