import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/shared/PageHeader';
import api from '../../services/api';
import { colors } from '../../constants/colors';
import type { TimetableSlot } from '@tribhuvan/shared';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ROW_H = 80;
const DAY_W = 44;
const SPACER_W = 5;
const SLOT_W = 110;
const CR_W = 40;
const LUNCH_W = 36;

type TimeSetting = { id: string; start: string; end: string; label?: string; isLunch?: boolean };

const getTeacherInitials = (name?: string) => {
  if (!name || name === 'TBA') return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return parts.map(p => p[0]).join('').toUpperCase();
};

export default function TimetableScreen() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const program = user?.student?.program || '';
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

  const renderDayCells = (day: string) => {
    const cells: React.ReactNode[] = [];
    let i = 0;
    while (i < timeSlots.length) {
      const ts = timeSlots[i];
      if (ts.isLunch) { i++; continue; }
      const classSlot = getSlotAt(day, ts.start);
      if (classSlot) {
        const span = calculateSpan(classSlot.startTime, classSlot.endTime);
        const colW = SLOT_W * span + CR_W * span;
        const teacherName = (classSlot as any).teacher?.user?.name || '';
        const initials = getTeacherInitials(teacherName);
        cells.push(
          <View key={`${day}-${i}`} style={[styles.subjectCell, { width: colW }]}>
            <Text style={styles.subjectText} numberOfLines={2}>{classSlot.subject.name}</Text>
            {initials ? <Text style={styles.initialsText}>({initials})</Text> : null}
          </View>
        );
        i += span;
      } else {
        cells.push(
          <View key={`${day}-e-${i}`} style={styles.emptyCell} />,
          <View key={`${day}-cr-${i}`} style={styles.crEmptyCell} />,
        );
        i++;
      }
    }
    return cells;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  const titleProgram = program.includes('Computer Science') ? 'BSC CS' : program.toUpperCase();
  const semRoman = semester === 6 ? 'VIth' : `Sem-${semester}`;

  const totalW = DAY_W + SPACER_W + timeSlots.reduce((acc, t) => acc + (t.isLunch ? LUNCH_W : SLOT_W + CR_W), 0);

  return (
    <View style={styles.container}>
      {/* Page Header outside scroll */}
      <View style={styles.headerPad}>
        <PageHeader title="Timetable" subtitle={`${program} • Semester ${semester}`} />
      </View>

      <View style={styles.scrollHintBar}>
        <Text style={styles.scrollHintText}>← Swipe left/right to see full timetable →</Text>
      </View>

      <ScrollView style={styles.outerScroll} contentContainerStyle={styles.outerScrollContent}>
        {/* The table is inside a horizontal ScrollView */}
        <ScrollView horizontal showsHorizontalScrollIndicator style={styles.hScroll}>
          <View style={[styles.table, { width: totalW + 8 }]}>

            {/* Title header row */}
            <View style={[styles.titleRow, { width: totalW }]}>
              <Text style={styles.titleText}>
                {titleProgram} Timetable: Semester-{semRoman}
              </Text>
            </View>

            {/* Column headers row */}
            <View style={[styles.headerRow, { width: totalW }]}>
              {/* Day name sticky header */}
              <View style={[styles.dayHeaderCell, { width: DAY_W }]} />
              <View style={{ width: SPACER_W, backgroundColor: '#fff' }} />
              {timeSlots.map((ts, idx) => {
                if (ts.isLunch) {
                  return (
                    <View key={ts.id} style={[styles.lunchHeaderCell, { width: LUNCH_W }]}>
                      <Text style={styles.lunchHeaderText}>
                        {ts.label || '12:55-1:35'}
                      </Text>
                    </View>
                  );
                }
                return (
                  <View key={ts.id} style={{ flexDirection: 'row' }}>
                    <View style={[styles.timeHeaderCell, { width: SLOT_W }]}>
                      <Text style={styles.timeHeaderText} numberOfLines={1}>
                        {ts.label || `${ts.start}-${ts.end}`}
                      </Text>
                    </View>
                    <View style={[styles.crHeaderCell, { width: CR_W }]}>
                      <Text style={styles.crHeaderText}>cr</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Day rows with LUNCH spanning all 5 rows */}
            <View style={{ flexDirection: 'row' }}>
              {/* Left: Day names + cells before lunch */}
              <View>
                {DAYS.map((day) => {
                  // Cells before lunch
                  const beforeLunchCells: React.ReactNode[] = [];
                  let i = 0;
                  while (i < timeSlots.length) {
                    const ts = timeSlots[i];
                    if (ts.isLunch) break;
                    const classSlot = getSlotAt(day, ts.start);
                    if (classSlot) {
                      const span = calculateSpan(classSlot.startTime, classSlot.endTime);
                      const colW = SLOT_W * span + CR_W * span;
                      const teacherName = (classSlot as any).teacher?.user?.name || '';
                      const initials = getTeacherInitials(teacherName);
                      beforeLunchCells.push(
                        <View key={`${day}-bl-${i}`} style={[styles.subjectCell, { width: colW, height: ROW_H }]}>
                          <Text style={styles.subjectText} numberOfLines={2}>{classSlot.subject.name}</Text>
                          {initials ? <Text style={styles.initialsText}>({initials})</Text> : null}
                        </View>
                      );
                      i += span;
                    } else {
                      beforeLunchCells.push(
                        <View key={`${day}-ble-${i}`} style={[styles.emptyCell, { height: ROW_H }]} />,
                        <View key={`${day}-blcr-${i}`} style={[styles.crEmptyCell, { height: ROW_H }]} />,
                      );
                      i++;
                    }
                  }

                  return (
                    <View key={day} style={[styles.dayRow, { height: ROW_H }]}>
                      {/* Day name cell */}
                      <View style={[styles.dayNameCell, { width: DAY_W, height: ROW_H }]}>
                        <Text style={styles.dayNameText}>{day.substring(0, 3).toUpperCase()}</Text>
                      </View>
                      <View style={{ width: SPACER_W, height: ROW_H, backgroundColor: '#fff' }} />
                      {beforeLunchCells}
                    </View>
                  );
                })}
              </View>

              {/* LUNCH column — spans all 5 rows */}
              <View style={[styles.lunchColumn, { height: ROW_H * 5, width: LUNCH_W }]}>
                <Text style={styles.lunchText}>L{'\n'}U{'\n'}N{'\n'}C{'\n'}H</Text>
              </View>

              {/* Right: cells after lunch */}
              <View>
                {DAYS.map((day) => {
                  const afterLunchCells: React.ReactNode[] = [];
                  let i = 0;
                  let pastLunch = false;
                  while (i < timeSlots.length) {
                    const ts = timeSlots[i];
                    if (ts.isLunch) { pastLunch = true; i++; continue; }
                    if (!pastLunch) { i++; continue; }

                    const classSlot = getSlotAt(day, ts.start);
                    if (classSlot) {
                      const span = calculateSpan(classSlot.startTime, classSlot.endTime);
                      const colW = SLOT_W * span + CR_W * span;
                      const teacherName = (classSlot as any).teacher?.user?.name || '';
                      const initials = getTeacherInitials(teacherName);
                      afterLunchCells.push(
                        <View key={`${day}-al-${i}`} style={[styles.subjectCell, { width: colW, height: ROW_H }]}>
                          <Text style={styles.subjectText} numberOfLines={2}>{classSlot.subject.name}</Text>
                          {initials ? <Text style={styles.initialsText}>({initials})</Text> : null}
                        </View>
                      );
                      i += span;
                    } else {
                      afterLunchCells.push(
                        <View key={`${day}-ale-${i}`} style={[styles.emptyCell, { height: ROW_H }]} />,
                        <View key={`${day}-alcr-${i}`} style={[styles.crEmptyCell, { height: ROW_H }]} />,
                      );
                      i++;
                    }
                  }

                  // If no lunch slot exists in settings, return empty
                  return (
                    <View key={`${day}-after`} style={[styles.dayRow, { height: ROW_H }]}>
                      {afterLunchCells}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const BORDER = { borderWidth: 1, borderColor: '#27272a' };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  headerPad: { paddingHorizontal: 16, paddingTop: 16 },
  scrollHintBar: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#f1f5f9', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 8, paddingHorizontal: 12 },
  scrollHintText: { fontSize: 12, fontWeight: '600', color: '#475569', textAlign: 'center' },
  outerScroll: { flex: 1 },
  outerScrollContent: { paddingBottom: 32, paddingHorizontal: 8 },
  hScroll: { flexGrow: 0 },
  table: { borderWidth: 2, borderColor: '#27272a', borderStyle: 'solid', backgroundColor: '#fff' },

  // Title header
  titleRow: { borderBottomWidth: 2, borderBottomColor: '#27272a', paddingVertical: 6, paddingHorizontal: 8, backgroundColor: '#fff', alignItems: 'center' },
  titleText: { fontSize: 11, fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },

  // Header row
  headerRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#27272a', backgroundColor: '#fff' },
  dayHeaderCell: { ...BORDER, backgroundColor: '#52525b' },
  timeHeaderCell: { ...BORDER, paddingHorizontal: 4, paddingVertical: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  timeHeaderText: { fontSize: 9, fontWeight: '700', color: '#000', textAlign: 'center' },
  crHeaderCell: { ...BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: '#52525b' },
  crHeaderText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'lowercase' },
  lunchHeaderCell: { ...BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 4 },
  lunchHeaderText: { fontSize: 8, fontWeight: '700', color: '#000', textAlign: 'center' },

  // Day rows
  dayRow: { flexDirection: 'row', alignItems: 'center' },
  dayNameCell: { ...BORDER, backgroundColor: '#52525b', alignItems: 'center', justifyContent: 'center' },
  dayNameText: { fontSize: 9, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 1 },

  // Subject cells
  subjectCell: { ...BORDER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, backgroundColor: '#fff' },
  subjectText: { fontSize: 10, fontWeight: '700', color: '#000', textAlign: 'center', lineHeight: 13 },
  initialsText: { fontSize: 9, color: '#52525b', marginTop: 2, textAlign: 'center' },

  emptyCell: { width: SLOT_W, ...BORDER, backgroundColor: '#fff' },
  crEmptyCell: { width: CR_W, ...BORDER, backgroundColor: '#fff' },

  // Lunch column
  lunchColumn: { ...BORDER, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#27272a' },
  lunchText: { fontSize: 10, fontWeight: '900', color: '#000', textAlign: 'center', letterSpacing: 4, lineHeight: 14 },
});
