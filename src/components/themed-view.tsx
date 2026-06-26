import { View, type ViewProps } from 'react-native';
import { Image, type ImageProps } from 'expo-image';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}

export type ThemedImageProps = ImageProps & {
  lightSource?: ImageProps['source'];
  darkSource?: ImageProps['source'];
};

export function ThemedImage({ source, lightSource, darkSource, ...otherProps }: ThemedImageProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const selectedSource = theme === 'dark' ? (darkSource ?? source) : (lightSource ?? source);

  return <Image source={selectedSource} {...otherProps} />;
}

