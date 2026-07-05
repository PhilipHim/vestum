import { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { localeTag } from '@/src/i18n';
import { ACCENT, COLORS, ICON_STROKE } from '@/src/themes/rn-tokens';
import type { SavedOutfit } from '@/src/types';

const CELL = (Dimensions.get('window').width - 40 - 24) / 7;

export default function CalendarScreen() {
  const router = useRouter();
  const { savedOutfits, settings, t } = useApp();
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = viewDate.toLocaleDateString(localeTag(settings.language), {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = [
    t('weekMon'),
    t('weekTue'),
    t('weekWed'),
    t('weekThu'),
    t('weekFri'),
    t('weekSat'),
    t('weekSun'),
  ];

  const outfitByDate = useMemo(() => {
    const map = new Map<string, SavedOutfit>();
    savedOutfits.forEach((o) => map.set(o.date, o));
    return map;
  }, [savedOutfits]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{t('calendarTitle')}</Text>
        <Text style={s.subtitle}>{t('calendarSubtitle')}</Text>

        <View style={s.nav}>
          <TouchableOpacity onPress={() => setMonthOffset((m) => m - 1)} hitSlop={12}>
            <ChevronLeft size={24} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          </TouchableOpacity>
          <Text style={s.month}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => setMonthOffset((m) => m + 1)} hitSlop={12}>
            <ChevronRight size={24} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
          </TouchableOpacity>
        </View>

        <View style={s.weekRow}>
          {weekDays.map((d) => (
            <Text key={d} style={s.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        <View style={s.grid}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={s.cell} />;
            }
            const dateKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const outfit = outfitByDate.get(dateKey);

            return (
              <TouchableOpacity
                key={dateKey}
                style={s.cell}
                onPress={() => outfit && router.push(`/outfit/${dateKey}` as Href)}
                activeOpacity={outfit ? 0.7 : 1}
                disabled={!outfit}
              >
                {outfit?.photoUri ? (
                  <Image source={{ uri: outfit.photoUri }} style={s.thumb} />
                ) : outfit?.paletteColors?.length ? (
                  <View style={s.paletteWrap}>
                    {outfit.paletteColors.slice(0, 4).map((c) => (
                      <View key={c} style={[s.paletteDot, { backgroundColor: c }]} />
                    ))}
                  </View>
                ) : outfit ? (
                  <View style={[s.thumb, s.outfitPlaceholder]}>
                    <Text style={s.placeholderText} numberOfLines={1}>
                      {outfit.top.slice(0, 3)}
                    </Text>
                  </View>
                ) : (
                  <View style={s.emptyCell} />
                )}
                <Text style={[s.dayNum, outfit && s.dayNumActive]}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.mutedDark, marginBottom: 20 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  month: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: {
    width: CELL,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: CELL, height: CELL + 14, alignItems: 'center', marginBottom: 4 },
  thumb: { width: CELL - 4, height: CELL - 4, borderRadius: 6, borderWidth: 1, borderColor: ACCENT.border },
  outfitPlaceholder: { backgroundColor: ACCENT.soft, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 9, color: ACCENT.primary, fontWeight: '700' },
  paletteWrap: {
    width: CELL - 4,
    height: CELL - 4,
    borderRadius: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ACCENT.border,
  },
  paletteDot: { width: '50%', height: '50%' },
  emptyCell: {
    width: CELL - 4,
    height: CELL - 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardInner,
  },
  dayNum: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  dayNumActive: { color: ACCENT.primary, fontWeight: '700' },
});
