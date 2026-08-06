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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { COLLEGE, PROGRAMS as FALLBACK_PROGRAMS } from '@tribhuvan/shared';

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

export default function UnifiedAuthScreen() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [role, setRole] = useState<RoleType>('STUDENT');
  const [activeTab, setActiveTab] = useState<TabType>('LOGIN');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Student Form States
  const [studentLoginData, setStudentLoginData] = useState({ enrollmentNumber: '', password: '' });
  const [studentSignupData, setStudentSignupData] = useState({
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

  // Teacher Form States
  const [teacherLoginData, setTeacherLoginData] = useState({ email: '', password: '' });
  const [teacherSignupData, setTeacherSignupData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setError(null);
    setSuccessMsg(null);
    setPendingNotice(null);
  };

  // --- Student Submit Handlers ---
  const handleStudentLoginSubmit = async () => {
    if (!studentLoginData.enrollmentNumber.trim() || !studentLoginData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    setPendingNotice(null);
    try {
      const res = await api.post('/auth/student/login', studentLoginData);
      const { token, user } = res.data.data;
      await setSession(token, user);
      router.replace('/(student)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignupSubmit = async () => {
    if (
      !studentSignupData.name.trim() ||
      !studentSignupData.email.trim() ||
      !studentSignupData.enrollmentNumber.trim() ||
      !studentSignupData.password
    ) {
      setError('Please fill in all required fields');
      return;
    }
    if (studentSignupData.password !== studentSignupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/student/signup', studentSignupData);
      const { token, user } = res.data.data;
      await setSession(token, user);
      router.replace('/(student)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // --- Teacher Submit Handlers ---
  const handleTeacherLoginSubmit = async () => {
    if (!teacherLoginData.email.trim() || !teacherLoginData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    setPendingNotice(null);
    try {
      const res = await api.post('/auth/teacher/login', teacherLoginData);
      const { token, user } = res.data.data;
      await setSession(token, user);
      router.replace('/(teacher)');
    } catch (err: any) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message;

      if (status === 403 && (code === 'PENDING_APPROVAL' || code === 'ACCOUNT_REJECTED')) {
        setPendingNotice(msg || 'Your account is pending administrator approval before login is permitted.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSignupSubmit = async () => {
    if (
      !teacherSignupData.name.trim() ||
      !teacherSignupData.email.trim() ||
      !teacherSignupData.employeeId.trim() ||
      !teacherSignupData.password
    ) {
      setError('Please fill in all required fields');
      return;
    }
    if (teacherSignupData.password !== teacherSignupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/teacher/signup', teacherSignupData);
      setSuccessMsg(res.data.message || 'Account registration submitted!');
      setActiveTab('LOGIN');
      setPendingNotice('Your account was submitted and is pending administrator approval.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Institutional Header Banner */}
          <View style={styles.header}>
            <View style={styles.sealContainer}>
              <View style={styles.sealOuterRing}>
                <View style={styles.sealInnerRing}>
                  <Text style={styles.sealMonogram}>T</Text>
                </View>
              </View>
            </View>

            <Text style={styles.collegeName}>{COLLEGE.name.toUpperCase()}</Text>
            <Text style={styles.tagline}>
              ENVIRONMENT & DEVELOPMENT SCIENCES • {COLLEGE.location.toUpperCase()}
            </Text>

            <View style={styles.goldDivider} />
          </View>

          {/* Form Card Container */}
          <View style={styles.card}>
            {/* Role Segmented Switcher (STUDENT / TEACHER) */}
            <View style={styles.roleSegmentContainer}>
              <TouchableOpacity
                style={[styles.roleSegmentBtn, role === 'STUDENT' && styles.roleSegmentBtnActive]}
                onPress={() => handleRoleChange('STUDENT')}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleSegmentText, role === 'STUDENT' && styles.roleSegmentTextActive]}>
                  STUDENT PORTAL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleSegmentBtn, role === 'TEACHER' && styles.roleSegmentBtnActive]}
                onPress={() => handleRoleChange('TEACHER')}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleSegmentText, role === 'TEACHER' && styles.roleSegmentTextActive]}>
                  TEACHER PORTAL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login / Signup Tab Pill */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'LOGIN' && styles.tabBtnActive]}
                onPress={() => handleTabChange('LOGIN')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'LOGIN' && styles.tabTextActive]}>
                  SIGN IN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'SIGNUP' && styles.tabBtnActive]}
                onPress={() => handleTabChange('SIGNUP')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'SIGNUP' && styles.tabTextActive]}>
                  NEW REGISTRATION
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Notifications */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✓ {successMsg}</Text>
              </View>
            ) : null}

            {pendingNotice ? (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingTitle}>⏳ APPROVAL PENDING</Text>
                <Text style={styles.pendingText}>{pendingNotice}</Text>
              </View>
            ) : null}

            {/* ---------------------------------------------------- */}
            {/* STUDENT LOGIN FORM                                   */}
            {/* ---------------------------------------------------- */}
            {role === 'STUDENT' && activeTab === 'LOGIN' && (
              <View style={styles.formGroup}>
                <Text style={styles.formSubtitle}>Enter your enrollment credentials to continue</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>ENROLLMENT NUMBER *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2024-CSE-042"
                    placeholderTextColor="#9a917e"
                    value={studentLoginData.enrollmentNumber}
                    onChangeText={(val) =>
                      setStudentLoginData((prev) => ({ ...prev, enrollmentNumber: val }))
                    }
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>PASSWORD *</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showPassword}
                      value={studentLoginData.password}
                      onChangeText={(val) =>
                        setStudentLoginData((prev) => ({ ...prev, password: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="SIGN IN AS STUDENT"
                  onPress={handleStudentLoginSubmit}
                  variant="gold"
                  loading={loading}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

            {/* ---------------------------------------------------- */}
            {/* STUDENT SIGNUP FORM                                  */}
            {/* ---------------------------------------------------- */}
            {role === 'STUDENT' && activeTab === 'SIGNUP' && (
              <View style={styles.formGroup}>
                <Text style={styles.formSubtitle}>Create your student portal account</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>FULL NAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#9a917e"
                    value={studentSignupData.name}
                    onChangeText={(val) => setStudentSignupData((p) => ({ ...p, name: val }))}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>ENROLLMENT NUMBER *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2024-CSE-042"
                    placeholderTextColor="#9a917e"
                    value={studentSignupData.enrollmentNumber}
                    onChangeText={(val) =>
                      setStudentSignupData((p) => ({ ...p, enrollmentNumber: val }))
                    }
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>EMAIL ADDRESS *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="student@tribhuvancollege.ac.in"
                    placeholderTextColor="#9a917e"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={studentSignupData.email}
                    onChangeText={(val) => setStudentSignupData((p) => ({ ...p, email: val }))}
                  />
                </View>

                {/* Program Selection */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>ACADEMIC PROGRAM *</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowProgramPicker((v) => !v)}
                  >
                    <Text style={styles.selectInputText}>{studentSignupData.program}</Text>
                    <Text style={styles.selectArrow}>{showProgramPicker ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {showProgramPicker && (
                    <View style={styles.pickerDropdown}>
                      {FALLBACK_PROGRAMS.map((prog) => (
                        <TouchableOpacity
                          key={prog.code}
                          style={[
                            styles.pickerItem,
                            studentSignupData.program === prog.name && styles.pickerItemActive,
                          ]}
                          onPress={() => {
                            setStudentSignupData((p) => ({ ...p, program: prog.name }));
                            setShowProgramPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              studentSignupData.program === prog.name && styles.pickerItemTextActive,
                            ]}
                          >
                            {prog.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Year & Semester Row */}
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>YEAR *</Text>
                    <View style={styles.numSelectorRow}>
                      {[1, 2, 3, 4].map((yr) => (
                        <TouchableOpacity
                          key={yr}
                          style={[
                            styles.numBtn,
                            studentSignupData.year === yr && styles.numBtnActive,
                          ]}
                          onPress={() => setStudentSignupData((p) => ({ ...p, year: yr }))}
                        >
                          <Text
                            style={[
                              styles.numBtnText,
                              studentSignupData.year === yr && styles.numBtnTextActive,
                            ]}
                          >
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>SEMESTER *</Text>
                    <View style={styles.numSelectorRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <TouchableOpacity
                          key={sem}
                          style={[
                            styles.numBtnSmall,
                            studentSignupData.semester === sem && styles.numBtnActive,
                          ]}
                          onPress={() => setStudentSignupData((p) => ({ ...p, semester: sem }))}
                        >
                          <Text
                            style={[
                              styles.numBtnTextSmall,
                              studentSignupData.semester === sem && styles.numBtnTextActive,
                            ]}
                          >
                            {sem}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Roll No & Section */}
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>ROLL NO (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 24001"
                      placeholderTextColor="#9a917e"
                      value={studentSignupData.rollNo}
                      onChangeText={(val) => setStudentSignupData((p) => ({ ...p, rollNo: val }))}
                    />
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>SECTION</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. A"
                      placeholderTextColor="#9a917e"
                      value={studentSignupData.section}
                      onChangeText={(val) => setStudentSignupData((p) => ({ ...p, section: val }))}
                    />
                  </View>
                </View>

                {/* Date of Birth & Hostel */}
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>DATE OF BIRTH</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9a917e"
                      value={studentSignupData.dateOfBirth}
                      onChangeText={(val) =>
                        setStudentSignupData((p) => ({ ...p, dateOfBirth: val }))
                      }
                    />
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>HOSTEL (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Block A"
                      placeholderTextColor="#9a917e"
                      value={studentSignupData.hostel}
                      onChangeText={(val) => setStudentSignupData((p) => ({ ...p, hostel: val }))}
                    />
                  </View>
                </View>

                {/* Password & Confirm Password */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>PASSWORD * (MIN 6 CHARS)</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showPassword}
                      value={studentSignupData.password}
                      onChangeText={(val) =>
                        setStudentSignupData((p) => ({ ...p, password: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>CONFIRM PASSWORD *</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showConfirmPassword}
                      value={studentSignupData.confirmPassword}
                      onChangeText={(val) =>
                        setStudentSignupData((p) => ({ ...p, confirmPassword: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showConfirmPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="REGISTER AS STUDENT"
                  onPress={handleStudentSignupSubmit}
                  variant="gold"
                  loading={loading}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

            {/* ---------------------------------------------------- */}
            {/* TEACHER LOGIN FORM                                   */}
            {/* ---------------------------------------------------- */}
            {role === 'TEACHER' && activeTab === 'LOGIN' && (
              <View style={styles.formGroup}>
                <Text style={styles.formSubtitle}>Enter your faculty credentials</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>COLLEGE GMAIL *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="faculty@tribhuvancollege.ac.in"
                    placeholderTextColor="#9a917e"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={teacherLoginData.email}
                    onChangeText={(val) =>
                      setTeacherLoginData((prev) => ({ ...prev, email: val }))
                    }
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>PASSWORD *</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showPassword}
                      value={teacherLoginData.password}
                      onChangeText={(val) =>
                        setTeacherLoginData((prev) => ({ ...prev, password: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="SIGN IN AS TEACHER"
                  onPress={handleTeacherLoginSubmit}
                  variant="gold"
                  loading={loading}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

            {/* ---------------------------------------------------- */}
            {/* TEACHER SIGNUP FORM                                  */}
            {/* ---------------------------------------------------- */}
            {role === 'TEACHER' && activeTab === 'SIGNUP' && (
              <View style={styles.formGroup}>
                <Text style={styles.formSubtitle}>
                  Submit your application for faculty approval
                </Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>FULL NAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dr. Ananya Roy"
                    placeholderTextColor="#9a917e"
                    value={teacherSignupData.name}
                    onChangeText={(val) => setTeacherSignupData((p) => ({ ...p, name: val }))}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>COLLEGE GMAIL *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ananya.roy@tribhuvancollege.ac.in"
                    placeholderTextColor="#9a917e"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={teacherSignupData.email}
                    onChangeText={(val) => setTeacherSignupData((p) => ({ ...p, email: val }))}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>EMPLOYEE ID *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. EMP-2024-101"
                    placeholderTextColor="#9a917e"
                    value={teacherSignupData.employeeId}
                    onChangeText={(val) => setTeacherSignupData((p) => ({ ...p, employeeId: val }))}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Department Picker */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>DEPARTMENT *</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowDeptPicker((v) => !v)}
                  >
                    <Text style={styles.selectInputText}>{teacherSignupData.department}</Text>
                    <Text style={styles.selectArrow}>{showDeptPicker ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {showDeptPicker && (
                    <View style={styles.pickerDropdown}>
                      {DEPARTMENTS.map((dept) => (
                        <TouchableOpacity
                          key={dept}
                          style={[
                            styles.pickerItem,
                            teacherSignupData.department === dept && styles.pickerItemActive,
                          ]}
                          onPress={() => {
                            setTeacherSignupData((p) => ({ ...p, department: dept }));
                            setShowDeptPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              teacherSignupData.department === dept && styles.pickerItemTextActive,
                            ]}
                          >
                            {dept}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>DESIGNATION</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Asst. Professor"
                      placeholderTextColor="#9a917e"
                      value={teacherSignupData.designation}
                      onChangeText={(val) =>
                        setTeacherSignupData((p) => ({ ...p, designation: val }))
                      }
                    />
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>PHONE (OPTIONAL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="+91 9876543210"
                      placeholderTextColor="#9a917e"
                      keyboardType="phone-pad"
                      value={teacherSignupData.phone}
                      onChangeText={(val) => setTeacherSignupData((p) => ({ ...p, phone: val }))}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>PASSWORD * (MIN 6 CHARS)</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showPassword}
                      value={teacherSignupData.password}
                      onChangeText={(val) =>
                        setTeacherSignupData((p) => ({ ...p, password: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>CONFIRM PASSWORD *</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#9a917e"
                      secureTextEntry={!showConfirmPassword}
                      value={teacherSignupData.confirmPassword}
                      onChangeText={(val) =>
                        setTeacherSignupData((p) => ({ ...p, confirmPassword: val }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPassword((v) => !v)}
                    >
                      <Text style={styles.eyeText}>{showConfirmPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  title="SUBMIT FOR APPROVAL"
                  onPress={handleTeacherSignupSubmit}
                  variant="gold"
                  loading={loading}
                  style={{ marginTop: 12 }}
                />
              </View>
            )}
          </View>

          {/* Admin Portal Navigation Link */}
          <TouchableOpacity
            style={styles.adminLinkBtn}
            onPress={() => router.push('/(auth)/admin-login')}
            activeOpacity={0.7}
          >
            <Text style={styles.adminLinkText}>ADMINISTRATOR PORTAL ACCESS →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  container: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  sealContainer: {
    marginBottom: 12,
  },
  sealOuterRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 146, 42, 0.08)',
  },
  sealInnerRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealMonogram: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.goldMuted,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  goldDivider: {
    width: 60,
    height: 2,
    backgroundColor: colors.gold,
    marginTop: 14,
    borderRadius: 1,
  },
  card: {
    width: '100%',
    backgroundColor: colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  roleSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.navyDark,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 201, 176, 0.15)',
  },
  roleSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  roleSegmentBtnActive: {
    backgroundColor: colors.gold,
  },
  roleSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
  },
  roleSegmentTextActive: {
    color: colors.navyDark,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 201, 176, 0.15)',
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.gold,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.gold,
    fontWeight: '700',
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textDark,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    paddingVertical: 6,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 0.5,
  },
  selectInput: {
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 13,
    color: colors.textDark,
    flex: 1,
  },
  selectArrow: {
    fontSize: 12,
    color: colors.goldMuted,
    marginLeft: 8,
  },
  pickerDropdown: {
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 180,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  pickerItemActive: {
    backgroundColor: 'rgba(200, 146, 42, 0.15)',
  },
  pickerItemText: {
    fontSize: 12,
    color: colors.textDark,
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: colors.goldDark,
  },
  numSelectorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  numBtn: {
    flex: 1,
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  numBtnSmall: {
    flex: 1,
    backgroundColor: colors.creamInput,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  numBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
  },
  numBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  numBtnTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDark,
  },
  numBtnTextActive: {
    color: colors.navyDark,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  pendingBox: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  pendingTitle: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pendingText: {
    color: colors.textLight,
    fontSize: 12,
    lineHeight: 18,
  },
  adminLinkBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 201, 176, 0.25)',
  },
  adminLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldMuted,
    letterSpacing: 1,
  },
});
