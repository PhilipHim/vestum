import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloudSun, Shirt, Sparkles } from 'lucide-react-native';
import { useApp } from '@/src/context/AppContext';
import { ACCENT, COLORS, ICON_STROKE, MIN_TOUCH } from '@/src/themes/rn-tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Sparkles,
    title: 'Discover your color season',
    body: 'Upload a selfie and let AI analyze your skin tone, hair, and eyes to find your perfect seasonal palette.',
  },
  {
    icon: Shirt,
    title: 'Build your digital wardrobe',
    body: 'Photograph your clothes and Vestum categorizes each piece by type, color, and season automatically.',
  },
  {
    icon: CloudSun,
    title: 'Dress smart every day',
    body: 'Get weather-aware outfit suggestions that match your palette and avoid repeating looks from the last 7 days.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    } else {
      void finish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.skipRow}>
        <TouchableOpacity onPress={finish} style={s.skipBtn} hitSlop={12}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[s.slide, { width }]}>
              <View style={s.iconBox}>
                <Icon size={48} color={ACCENT.primary} strokeWidth={ICON_STROKE} />
              </View>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.body}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {SLIDES.map((slide, i) => (
            <View key={slide.title} style={[s.dot, i === index && s.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={s.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={s.nextText}>{isLast ? 'Get started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipBtn: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
  },
  skipText: {
    color: COLORS.mutedDark,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: ACCENT.soft,
    borderWidth: 1,
    borderColor: ACCENT.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  body: {
    fontSize: 15,
    color: COLORS.mutedDark,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 16,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: ACCENT.primary,
    width: 24,
  },
  nextBtn: {
    backgroundColor: ACCENT.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
