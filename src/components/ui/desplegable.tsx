import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type SideDrawerProps = {
  visible: boolean;
  onClose: () => void;
  items?: MenuItem[];
};

export function SideDrawer({
  visible,
  onClose,
  items = [],
}: SideDrawerProps) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <ThemedView style={[styles.modal, { backgroundColor: theme.background }]}>
        <View style={styles.menuContainer}>
          {items.map((item, index) => (
            <Pressable key={index} style={styles.menuItem} onPress={() => {
              item.onPress();
              onClose();
            }}>
              <Ionicons name={item.icon} size={22} color={theme.text} />
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  modal: {
    width: 280,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  menuContainer: {
    gap: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  menuLabel: {
    fontSize: 16,
  },
});
