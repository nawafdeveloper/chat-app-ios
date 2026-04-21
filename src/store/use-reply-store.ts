import { create } from 'zustand';

type ReplyStore = {
    isReplying: boolean;
    replyToUser: string | null;
    replyMessage: string | null;
    setReply: (user: string, message: string) => void;
    clearReply: () => void;
};

export const useReplyStore = create<ReplyStore>((set) => ({
    isReplying: false,
    replyToUser: null,
    replyMessage: null,
    setReply: (user, message) =>
        set({ isReplying: true, replyToUser: user, replyMessage: message }),
    clearReply: () =>
        set({ isReplying: false, replyToUser: null, replyMessage: null }),
}));