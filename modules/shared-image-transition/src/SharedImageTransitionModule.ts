import { NativeModule, requireNativeModule } from 'expo';
import { SharedImageTransitionModuleEvents } from './SharedImageTransition.types';

declare class SharedImageTransitionModule extends NativeModule<SharedImageTransitionModuleEvents> {
  registerTag(tag: string, viewTag: number): void;
  unregisterTag(tag: string): void;
  prepareTransition(tag: string): void;
}

export default requireNativeModule<SharedImageTransitionModule>('SharedImageTransition');