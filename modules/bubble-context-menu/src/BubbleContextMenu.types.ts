import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type BubbleContextMenuItem = {
  id: string;
  title: string;
  systemImage?: string;
  destructive?: boolean;
};

export type BubbleContextMenuActionEvent = {
  nativeEvent: {
    id: string;
  };
};

export type BubbleContextMenuLifecycleEvent = {
  nativeEvent: Record<string, never>;
};

export type BubbleReactionSelectedEvent = {
  nativeEvent: {
    emoji: string;
  };
};

export type BubbleContextMenuModuleEvents = Record<string, never>;

export type BubbleContextMenuViewProps = {
  menuItems: BubbleContextMenuItem[];
  reactionEmojis?: string[];
  onMenuAction?: (event: BubbleContextMenuActionEvent) => void;
  onMenuWillShow?: (event: BubbleContextMenuLifecycleEvent) => void;
  onMenuDidHide?: (event: BubbleContextMenuLifecycleEvent) => void;
  onReactionSelected?: (event: BubbleReactionSelectedEvent) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
