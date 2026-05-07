import { authClient } from "@/lib/auth-client";
import { clearAllSensitiveData } from "@/lib/crypto-storage";
import { useState } from "react";
import { Alert } from "react-native";

export const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogout = async () => {
        setError(false);
        setErrorMsg('');
        try {
            setLoading(true);
            const { error } = await authClient.signOut();
            if (error) {
                setError(true);
                setErrorMsg(error.message || 'Something went wrong, please try again.');
                return;
            }
            await clearAllSensitiveData();
        } catch (error: any) {
            setError(true);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out? This will delete all chats and messages on this phone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: handleLogout },
            ]
        );
    };

    return {
        loading,
        error,
        errorMsg,
        confirmLogout,
        handleLogout,
    };
};