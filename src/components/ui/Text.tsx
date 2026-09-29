import { Text as RNText, type TextProps } from 'react-native';

/**
 * App text: IBM Plex Sans in bone by default. Pass a `font-headline`, `font-display*`, `font-ui-*`, or `font-data*`
 * class to switch family; a default family is only added when none is given, because two
 * font-family utilities would otherwise compete by stylesheet order.
 */
export function Text({ className = '', ...props }: TextProps & { className?: string }) {
  const family = /\bfont-(ui|display|data|headline)/.test(className) ? '' : 'font-ui ';
  const color = /\btext-(ink|signal|vital|caution|alarm|paper|canvas|white)/.test(className)
    ? ''
    : 'text-ink ';
  return <RNText className={`${family}${color}${className}`} {...props} />;
}
