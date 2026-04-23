import { requireNativeView } from 'expo';
import * as React from 'react';

import { BubbleContextMenuViewProps } from './BubbleContextMenu.types';

const NativeView: React.ComponentType<BubbleContextMenuViewProps> =
  requireNativeView('BubbleContextMenu');

export default function BubbleContextMenuView(props: BubbleContextMenuViewProps) {
  return <NativeView {...props} />;
}
