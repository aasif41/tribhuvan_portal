import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/shared/PageHeader';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import type { TimetableSlot } from '@tribhuvan/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ROW_H = 88;
const DAY_W = 46;
const SPACER_W = 6;
const SLOT_W = 136;
const CR_W = 44;
const LUNCH_W = 76;

type TimeSetting = { id: string; start: string; end: string; label?: string; isLunch?: boolean };

const getTeacherInitials = (name?: string) => {
  if (!name || name === 'TBA') return '';
  if (name === 'C') return 'C';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return parts.map(p => p[0]).join('').toUpperCase();
};

export default function TimetableScreen() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');

  const tableRef = useRef<View>(null);

  const program = user?.student?.program || 'B.Tech Computer Science & Engineering';
  const semester = user?.student?.semester || 1;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [settingsRes, slotsRes] = await Promise.all([
          api.get('/timetable/settings'),
          api.get(`/timetable?program=${encodeURIComponent(program)}&semester=${semester}`),
        ]);
        setTimeSlots(settingsRes.data.data || []);
        setSlots(slotsRes.data.data || []);
      } catch (e) {
        console.error('Timetable fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [program, semester]);

  const getSlotAt = (day: string, startTime: string) =>
    slots.find(s => s.day === day && s.startTime === startTime);

  const calculateSpan = (start: string, end: string) => {
    const si = timeSlots.findIndex(t => t.start === start);
    const ei = timeSlots.findIndex(t => t.end === end);
    return si !== -1 && ei !== -1 ? ei - si + 1 : 1;
  };

  // ── Capture & Download Timetable ──
  const handleDownloadImage = async (format: 'png' | 'jpg' = 'png') => {
    if (!tableRef.current) {
      Alert.alert('Error', 'Unable to capture timetable at this moment.');
      return;
    }

    try {
      setExporting(true);
      // Capture full resolution view of table
      const uri = await captureRef(tableRef, {
        format,
        quality: 1.0,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        const cleanProgram = program.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Timetable_${cleanProgram}_Sem${semester}.${format}`;
        const newPath = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: newPath,
        });

        await Sharing.shareAsync(newPath, {
          mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
          dialogTitle: `Download Timetable (${format.toUpperCase()})`,
          UTI: format === 'png' ? 'public.png' : 'public.jpeg',
        });
      } else {
        Alert.alert('Saved', `Timetable image generated: ${uri}`);
      }
    } catch (err: any) {
      console.error('Failed to export timetable image:', err);
      Alert.alert('Export Failed', 'Could not export timetable image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading official timetable...</Text>
      </View>
    );
  }

  // Calculate table width
  const titleProgram = program.includes('Computer Science') ? 'BSC CS' : program.toUpperCase();
  const semRoman = semester === 6 ? 'VIth' : `Semester-${semester}`;

  // Time slots before lunch and after lunch
  const lunchIndex = timeSlots.findIndex(t => t.isLunch);
  const slotsBeforeLunch = lunchIndex !== -1 ? timeSlots.slice(0, lunchIndex) : timeSlots;
  const slotsAfterLunch = lunchIndex !== -1 ? timeSlots.slice(lunchIndex + 1) : [];

  const totalW =
    DAY_W +
    SPACER_W +
    slotsBeforeLunch.reduce((acc, _) => acc + SLOT_W + CR_W, 0) +
    (lunchIndex !== -1 ? LUNCH_W : 0) +
    slotsAfterLunch.reduce((acc, _) => acc + SLOT_W + CR_W, 0);

  return (
    <View style={styles.container}>
      {/* Page Header Area */}
      <View style={styles.headerPad}>
        <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />

        {/* Action & Download Bar */}
        <View style={styles.actionBar}>
          <View style={styles.downloadOptions}>
            <TouchableOpacity
              style={[styles.downloadBtn, exportFormat === 'png' && styles.downloadBtnActive]}
              onPress={() => handleDownloadImage('png')}
              disabled={exporting}
              activeOpacity={0.8}
            >
              {exporting && exportFormat === 'png' ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.downloadBtnContent}>
                  <Ionicons name="download-outline" size={15} color="#ffffff" />
                  <Text style={styles.downloadBtnText}>Save as PNG</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtnSecondary]}
              onPress={() => handleDownloadImage('jpg')}
              disabled={exporting}
              activeOpacity={0.8}
            >
              {exporting && exportFormat === 'jpg' ? (
                <ActivityIndicator size="small" color={colors.navyDark} />
              ) : (
                <View style={styles.downloadBtnContent}>
                  <Feather name="image" size={14} color={colors.navyDark} />
                  <Text style={styles.downloadBtnTextSecondary}>Save as JPG</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Swipe Indicator Banner */}
        <View style={styles.scrollHintBanner}>
          <View style={styles.hintLeft}>
            <Ionicons name="swap-horizontal" size={16} color="#334155" style={{ marginRight: 6 }} />
            <Text style={styles.scrollHintText}>Swipe left / right to view full timetable</Text>
          </View>
          <View style={styles.badgeArrow}>
            <Text style={styles.badgeArrowText}>← →</Text>
          </View>
        </View>
      </View>

      {/* Outer Scroll & Table */}
      <ScrollView
        style={styles.outerScroll}
        contentContainerStyle={styles.outerScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Scroll Area */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.hScroll}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        >
          {/* Double-bordered Official Timetable Frame Container */}
          <View style={styles.doubleFrameBorder}>
            <View
              ref={tableRef}
              collapsable={false}
              style={[styles.officialTable, { width: totalW }]}
            >
              {/* 1. Official Header Title Row */}
              <View style={[styles.titleHeaderRow, { width: totalW }]}>
                <Text style={styles.titleHeaderText}>
                  {titleProgram} Timetable: {semRoman}
                </Text>
              </View>

              {/* 2. Column Headers (Day + Time Slots + CR + Lunch) */}
              <View style={[styles.columnHeadersRow, { width: totalW }]}>
                {/* Blank Day Header Cell */}
                <View style={[styles.dayHeaderCell, { width: DAY_W }]} />
                <View style={[styles.spacerCell, { width: SPACER_W }]} />

                {/* Morning Slots before Lunch */}
                {slotsBeforeLunch.map((slot) => (
                  <React.Fragment key={slot.id}>
                    <View style={[styles.timeSlotHeader, { width: SLOT_W }]}>
                      <Text style={styles.timeSlotHeaderText} numberOfLines={1}>
                        {slot.label || `${slot.start} - ${slot.end}`}
                      </Text>
                    </View>
                    <View style={[styles.crHeaderCell, { width: CR_W }]}>
                      <Text style={styles.crHeaderText}>cr</Text>
                    </View>
                  </React.Fragment>
                ))}

                {/* Lunch Header */}
                {lunchIndex !== -1 && (
                  <View style={[styles.lunchHeaderCell, { width: LUNCH_W }]}>
                    <Text style={styles.lunchHeaderText} numberOfLines={1}>
                      {timeSlots[lunchIndex].label || '12:55 - 1:35'}
                    </Text>
                  </View>
                )}

                {/* Afternoon Slots after Lunch */}
                {slotsAfterLunch.map((slot) => (
                  <React.Fragment key={slot.id}>
                    <View style={[styles.timeSlotHeader, { width: SLOT_W }]}>
                      <Text style={styles.timeSlotHeaderText} numberOfLines={1}>
                        {slot.label || `${slot.start} - ${slot.end}`}
                      </Text>
                    </View>
                    <View style={[styles.crHeaderCell, { width: CR_W }]}>
                      <Text style={styles.crHeaderText}>cr</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              {/* 3. Day Rows (Monday through Friday) */}
              <View style={{ flexDirection: 'row', width: totalW }}>
                {/* Left Block: Day Names & Morning Slots */}
                <View>
                  {DAYS.map((day) => {
                    const beforeCells: React.ReactNode[] = [];
                    let i = 0;
                    while (i < slotsBeforeLunch.length) {
                      const ts = slotsBeforeLunch[i];
                      const classSlot = getSlotAt(day, ts.start);

                      if (classSlot) {
                        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
                        // Multi-slot span: covers span subject cells + (span - 1) cr cells
                        const subjWidth = SLOT_W * span + CR_W * (span - 1);
                        const teacherName =
                          (classSlot as any).teacher?.user?.name ||
                          (classSlot.subject as any)?.teacher?.user?.name ||
                          '';
                        const initials = getTeacherInitials(teacherName);
                        const room = classSlot.room && classSlot.room !== 'TBA' ? classSlot.room : '';

                        beforeCells.push(
                          <View
                            key={`${day}-bl-${i}`}
                            style={[styles.subjectCell, { width: subjWidth, height: ROW_H }]}
                          >
                            <Text style={styles.subjectNameText} numberOfLines={2}>
                              {classSlot.subject.name}
                            </Text>
                            {initials ? (
                              <Text style={styles.teacherInitialsText}>({initials})</Text>
                            ) : null}
                          </View>
                        );

                        // CR cell for this class
                        beforeCells.push(
                          <View
                            key={`${day}-blcr-${i}`}
                            style={[styles.crCell, { width: CR_W, height: ROW_H }]}
                          >
                            <Text style={styles.crCellText} numberOfLines={1}>
                              {room}
                            </Text>
                          </View>
                        );

                        i += span;
                      } else {
                        // Empty slot
                        beforeCells.push(
                          <View
                            key={`${day}-ble-${i}`}
                            style={[styles.emptyCell, { width: SLOT_W, height: ROW_H }]}
                          />,
                          <View
                            key={`${day}-blcre-${i}`}
                            style={[styles.crEmptyCell, { width: CR_W, height: ROW_H }]}
                          />
                        );
                        i++;
                      }
                    }

                    return (
                      <View key={day} style={[styles.dayRow, { height: ROW_H }]}>
                        {/* Day Vertical Label */}
                        <View style={[styles.dayNameCell, { width: DAY_W, height: ROW_H }]}>
                          <Text style={styles.dayNameText}>
                            {day.toUpperCase()}
                          </Text>
                        </View>
                        {/* White Spacer */}
                        <View style={[styles.spacerCell, { width: SPACER_W, height: ROW_H }]} />
                        {beforeCells}
                      </View>
                    );
                  })}
                </View>

                {/* Middle: Tall LUNCH Column Spanning All 5 Days */}
                {lunchIndex !== -1 && (
                  <View style={[styles.lunchTallColumn, { width: LUNCH_W, height: ROW_H * 5 }]}>
                    <Text style={styles.lunchVerticalText}>
                      L  U  N  C  H
                    </Text>
                  </View>
                )}

                {/* Right Block: Afternoon Slots After Lunch */}
                {lunchIndex !== -1 && (
                  <View>
                    {DAYS.map((day) => {
                      const afterCells: React.ReactNode[] = [];
                      let i = 0;
                      while (i < slotsAfterLunch.length) {
                        const ts = slotsAfterLunch[i];
                        const classSlot = getSlotAt(day, ts.start);

                        if (classSlot) {
                          const span = calculateSpan(classSlot.startTime, classSlot.endTime);
                          const subjWidth = SLOT_W * span + CR_W * (span - 1);
                          const teacherName =
                            (classSlot as any).teacher?.user?.name ||
                            (classSlot.subject as any)?.teacher?.user?.name ||
                            '';
                          const initials = getTeacherInitials(teacherName);
                          const room = classSlot.room && classSlot.room !== 'TBA' ? classSlot.room : '';

                          afterCells.push(
                            <View
                              key={`${day}-al-${i}`}
                              style={[styles.subjectCell, { width: subjWidth, height: ROW_H }]}
                            >
                              <Text style={styles.subjectNameText} numberOfLines={2}>
                                {classSlot.subject.name}
                              </Text>
                              {initials ? (
                                <Text style={styles.teacherInitialsText}>({initials})</Text>
                              ) : null}
                            </View>
                          );

                          afterCells.push(
                            <View
                              key={`${day}-alcr-${i}`}
                              style={[styles.crCell, { width: CR_W, height: ROW_H }]}
                            >
                              <Text style={styles.crCellText} numberOfLines={1}>
                                {room}
                              </Text>
                            </View>
                          );

                          i += span;
                        } else {
                          afterCells.push(
                            <View
                              key={`${day}-ale-${i}`}
                              style={[styles.emptyCell, { width: SLOT_W, height: ROW_H }]}
                            />,
                            <View
                              key={`${day}-alcre-${i}`}
                              style={[styles.crEmptyCell, { width: CR_W, height: ROW_H }]}
                            />
                          );
                          i++;
                        }
                      }

                      return (
                        <View key={`${day}-after`} style={[styles.dayRow, { height: ROW_H }]}>
                          {afterCells}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const CELL_BORDER = {
  borderWidth: 1,
  borderColor: '#27272a',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ece4',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0ece4',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
  },

  // ── HEADER ──
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f0ece4',
  },

  // Action / Download buttons
  actionBar: {
    marginBottom: 10,
  },
  downloadOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#0d1f3c',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8922a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadBtnActive: {
    backgroundColor: '#0d1f3c',
  },
  downloadBtnSecondary: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d4c9b0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  downloadBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  downloadBtnTextSecondary: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0d1f3c',
    letterSpacing: 0.3,
  },

  // Swipe hint banner
  scrollHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scrollHintText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  badgeArrow: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeArrowText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── SCROLL & DOUBLE-FRAME TABLE ──
  outerScroll: {
    flex: 1,
  },
  outerScrollContent: {
    paddingBottom: 36,
  },
  hScroll: {
    flexGrow: 0,
  },

  doubleFrameBorder: {
    borderWidth: 3,
    borderColor: '#27272a',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  officialTable: {
    borderWidth: 1.5,
    borderColor: '#27272a',
    backgroundColor: '#ffffff',
  },

  // ── TITLE ROW ──
  titleHeaderRow: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#27272a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleHeaderText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // ── COLUMN HEADERS ROW ──
  columnHeadersRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#27272a',
    backgroundColor: '#ffffff',
  },
  dayHeaderCell: {
    ...CELL_BORDER,
    backgroundColor: '#52525b',
  },
  spacerCell: {
    backgroundColor: '#ffffff',
  },
  timeSlotHeader: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  crHeaderCell: {
    ...CELL_BORDER,
    backgroundColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'lowercase',
  },
  lunchHeaderCell: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  lunchHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },

  // ── DAY ROWS & CELLS ──
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNameCell: {
    ...CELL_BORDER,
    backgroundColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayNameText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.5,
    transform: [{ rotate: '-90deg' }],
    width: 70,
  },

  subjectCell: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  subjectNameText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 15,
  },
  teacherInitialsText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#3f3f46',
    marginTop: 3,
    textAlign: 'center',
  },

  crCell: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  crCellText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },

  emptyCell: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
  },
  crEmptyCell: {
    ...CELL_BORDER,
    backgroundColor: '#ffffff',
  },

  // ── TALL LUNCH COLUMN ──
  lunchTallColumn: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#27272a',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  lunchVerticalText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 4,
    transform: [{ rotate: '-90deg' }],
    width: 240,
  },
});
