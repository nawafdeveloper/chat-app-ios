import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './SharedImageTransition.types';

type SharedImageTransitionModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class SharedImageTransitionModule extends NativeModule<SharedImageTransitionModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(SharedImageTransitionModule, 'SharedImageTransitionModule');
