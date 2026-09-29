import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { palette, type IconName } from '@/theme';

export function Icon({
  name,
  size = 18,
  color = palette.inkMuted,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
