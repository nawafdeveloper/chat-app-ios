import { NativeModule, requireNativeModule } from 'expo';

import { BubbleReactionOverlayModuleEvents } from './BubbleReactionOverlay.types';

declare class BubbleReactionOverlayModule extends NativeModule<BubbleReactionOverlayModuleEvents> {}

// This call loads the native module object from the JSI.
export default requireNativeModule<BubbleReactionOverlayModule>('BubbleReactionOverlay');
