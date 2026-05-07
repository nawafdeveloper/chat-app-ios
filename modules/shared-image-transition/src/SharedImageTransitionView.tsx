import { requireNativeView } from 'expo';
import * as React from 'react';

import { SharedImageTransitionViewProps } from './SharedImageTransition.types';

const NativeView: React.ComponentType<SharedImageTransitionViewProps> =
  requireNativeView('SharedImageTransition');

export default function SharedImageTransitionView(props: SharedImageTransitionViewProps) {
  return <NativeView {...props} />;
}
