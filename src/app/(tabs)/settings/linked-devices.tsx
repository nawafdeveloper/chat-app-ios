import { Form, Host, HStack, Image, Section, Text } from '@expo/ui/swift-ui'
import { listSectionSpacing } from '@expo/ui/swift-ui/modifiers'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'

const LinkedDevicesPageSettings = () => {
    const scheme = useColorScheme()

    return (
        <Host style={{ flex: 1 }}>
            <Form>
                <Section
                    title='Linked Devices'
                    footer={
                        <HStack spacing={4} alignment='firstTextBaseline'>
                            <Image systemName="lock" color="secondary" size={12} />
                            <Text>Messages and chat information are protected by end-to-end encryption on all devices.</Text>
                        </HStack>
                    }
                    modifiers={[listSectionSpacing('compact')]}
                >
                    <Text modifiers={[]}>No linked devices</Text>
                </Section>
            </Form>
        </Host>
    )
}

export default LinkedDevicesPageSettings

const styles = StyleSheet.create({
    main: {
        flex: 1
    }
})