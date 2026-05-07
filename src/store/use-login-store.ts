import { CountryCodeData, countryCodes } from "@/constants/country-codes";
import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { create } from "zustand";

export type { CountryCodeData };

export type LoginStep = "phone" | "otp";

const OTP_LENGTH = 6;

const DEFAULT_COUNTRY: CountryCodeData =
    countryCodes.find((c) => c.key === "sa") ?? countryCodes[0];

type LoginState = {
    step: LoginStep;

    selectedCountry: CountryCodeData;
    setSelectedCountry: (country: CountryCodeData) => void;

    phoneNumber: string;
    setPhoneNumber: (phone: string) => void;
    fullPhoneNumber: string;
    phoneMaxLength: number;
    isNextEnabled: boolean;

    otp: string;
    setOtp: (otp: string) => void;

    isLoading: boolean;
    error: string | null;

    handleNext: () => Promise<void>;
    handleVerify: () => Promise<void>;
    reset: () => void;
};

export const useLoginStore = create<LoginState>((set, get) => ({
    step: "phone",

    selectedCountry: DEFAULT_COUNTRY,
    setSelectedCountry: (country) => {
        const maxLength = country.maxLength;
        const { phoneNumber } = get();
        const trimmed = phoneNumber.slice(0, maxLength);
        set({
            selectedCountry: country,
            phoneNumber: trimmed,
            phoneMaxLength: maxLength,
            fullPhoneNumber: trimmed ? `${country.code}${trimmed}` : "",
            isNextEnabled: trimmed.length === maxLength,
        });
    },

    phoneNumber: "",
    fullPhoneNumber: "",
    phoneMaxLength: DEFAULT_COUNTRY.maxLength,
    isNextEnabled: false,
    setPhoneNumber: (phone) => {
        const { selectedCountry, phoneMaxLength } = get();
        const digits = phone.replace(/\D/g, "").slice(0, phoneMaxLength);
        set({
            phoneNumber: digits,
            fullPhoneNumber: digits ? `${selectedCountry.code}${digits}` : "",
            isNextEnabled: digits.length === phoneMaxLength,
        });
    },

    otp: "",
    setOtp: (otp) => {
        const digits = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
        set({ otp: digits });
        if (digits.length === OTP_LENGTH) {
            get().handleVerify();
        }
    },

    isLoading: false,
    error: null,

    handleNext: async () => {
        const { fullPhoneNumber, isNextEnabled } = get();
        if (!isNextEnabled) return;
        set({ isLoading: true, error: null });
        try {
            const { error } = await authClient.phoneNumber.sendOtp({
                phoneNumber: fullPhoneNumber,
            });

            if (error) {
                console.log(error.message);
                return;
            }

            set({ step: "otp", otp: "" });
            router.push("/(auth)/otp-verification");
        } catch {
            set({ error: "Failed to send OTP. Please try again." });
        } finally {
            set({ isLoading: false });
        }
    },

    handleVerify: async () => {
        const { otp, fullPhoneNumber } = get();
        set({ isLoading: true, error: null });
        try {
            const { error } = await authClient.phoneNumber.verify({
                phoneNumber: fullPhoneNumber,
                code: otp,
                disableSession: false,
                updatePhoneNumber: false,
            });

            if (error) {
                console.log(error.message);
                return;
            }

            router.push("/(newUser)");
        } catch {
            set({ error: "Invalid OTP. Please try again." });
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () =>
        set({
            step: "phone",
            selectedCountry: DEFAULT_COUNTRY,
            phoneNumber: "",
            fullPhoneNumber: "",
            phoneMaxLength: DEFAULT_COUNTRY.maxLength,
            isNextEnabled: false,
            otp: "",
            isLoading: false,
            error: null,
        }),
}));