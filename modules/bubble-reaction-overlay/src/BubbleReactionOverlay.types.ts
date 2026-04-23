import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type BubbleReactionSelectedEvent = {
  nativeEvent: {
    emoji: string;
  };
};

export type BubbleReactionOverlayDismissEvent = {
  nativeEvent: Record<string, never>;
};

export type BubbleReactionOverlayModuleEvents = Record<string, never>;

export type BubbleReactionOverlayViewProps = {
  visible?: boolean;
  emojis?: string[];
  minimumPressDuration?: number;
  overlayOpacity?: number;
  onReactionSelected?: (event: BubbleReactionSelectedEvent) => void;
  onDismiss?: (event: BubbleReactionOverlayDismissEvent) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
