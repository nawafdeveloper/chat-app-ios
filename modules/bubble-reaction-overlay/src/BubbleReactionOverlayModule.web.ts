import { registerWebModule, NativeModule } from 'expo';

import { BubbleReactionOverlayModuleEvents } from './BubbleReactionOverlay.types';

class BubbleReactionOverlayModule extends NativeModule<BubbleReactionOverlayModuleEvents> {}

export default registerWebModule(BubbleReactionOverlayModule, 'BubbleReactionOverlay');
