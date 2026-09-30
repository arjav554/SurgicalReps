import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { palette } from '@/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style' | 'className' | 'secureTextEntry'> {
  label: string;
  error?: string | null;
  /** Password field with a show/hide toggle. */
  secret?: boolean;
}

/** Labelled input: mono label, ruled 4px box, error line beneath. The ref reaches the underlying input. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, secret = false, ...input },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const border = error ? 'border-alarm' : focused ? 'border-gold' : 'border-field';
  return (
    <View className="gap-1.5">
      <Text className="font-data-medium text-[10px] uppercase tracking-[1.5px] text-ink-faint">{label}</Text>
      <View className={`h-12 flex-row items-center rounded-sm border bg-surface pl-3.5 ${border}`}>
        <TextInput
          {...input}
          ref={ref}
          accessibilityLabel={error ? `${label}, ${error}` : label}
          secureTextEntry={secret && !revealed}
          placeholderTextColor={palette.inkFaint}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          className="h-full flex-1 pr-3 font-ui text-[15px] text-ink"
          style={{ outlineStyle: 'none' } as object}
        />
        {secret && (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            cue="tick"
            tint={false}
            onPress={() => setRevealed((v) => !v)}
            className="h-full w-11 items-center justify-center"
          >
            <Icon name={revealed ? 'eye-off-outline' : 'eye-outline'} size={18} color={palette.inkFaint} />
          </PressableScale>
        )}
      </View>
      {error ? (
        <Text role="alert" aria-live="polite" accessibilityLiveRegion="polite" className="text-[13px] leading-5 text-alarm">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
