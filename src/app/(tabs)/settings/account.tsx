import { Button, Form, Host, HStack, Image, Section, Spacer, Text } from '@expo/ui/swift-ui'
import { buttonStyle } from '@expo/ui/swift-ui/modifiers'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'

const AccountPageSettings = () => {
    const scheme = useColorScheme()
    
    return (
        <Host style={{ flex: 1 }}>
            <Form>
                <Section>
                    <Button modifiers={[buttonStyle('plain')]}>
                        <HStack spacing={8}>
                            <Text>Request account information</Text>
                            <Spacer />
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                    <Button modifiers={[buttonStyle('plain')]}>
                        <HStack spacing={8}>
                            <Text>Delete my account</Text>
                            <Spacer />
                            <Image systemName="chevron.right" size={14} color="secondary" />
                        </HStack>
                    </Button>
                </Section>
            </Form>
        </Host>
    )
}

export default AccountPageSettings

const styles = StyleSheet.create({
    main: {
        flex: 1
    }
})