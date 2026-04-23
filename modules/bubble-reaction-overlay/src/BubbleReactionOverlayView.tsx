import { requireNativeView } from 'expo';
import * as React from 'react';

import { BubbleReactionOverlayViewProps } from './BubbleReactionOverlay.types';

const NativeView: React.ComponentType<BubbleReactionOverlayViewProps> =
  requireNativeView('BubbleReactionOverlay');

export default function BubbleReactionOverlayView(props: BubbleReactionOverlayViewProps) {
  return <NativeView {...props} />;
}
