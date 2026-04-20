import { authClient } from "@/lib/auth-client";
import { clearAllSensitiveData } from "@/lib/crypto-storage";
import { useState } from "react";

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
                console.log(error.message);
                return;
            }

            await clearAllSensitiveData()
        } catch (error: any) {
            setError(true);
            setErrorMsg(error.message);
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        errorMsg,
        handleLogout
    }
};