import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { DynamicColorIOS, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const activeColor = DynamicColorIOS({ dark: '#FFFFFF', light: '#000000' });

  return (
    <NativeTabs
      indicatorColor={colors.backgroundElement}
      tintColor={activeColor}
      labelStyle={{ color: DynamicColorIOS({ dark: '#FFFFFF', light: '#000000' }) }}
      badgeBackgroundColor={'#25D366'}
    >
      <NativeTabs.Trigger name="index" hidden />
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'message', selected: 'message.fill' }} />
        <NativeTabs.Trigger.Badge>12</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="archive">
        <NativeTabs.Trigger.Label>Archive</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'archivebox', selected: 'archivebox.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gear', selected: 'gear' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
