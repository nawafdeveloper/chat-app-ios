const AppearanceFormatter = (privacySetting: string | null | undefined) => {
    if (!privacySetting || typeof privacySetting !== 'string') {
        return null;
    }

    const setting = privacySetting.toLowerCase();

    switch (setting) {
        case 'all':
            return 'Everyone';
        case 'nobody':
            return 'Nobody';
        case 'contacts':
            return 'Contacts';
        default:
            return null;
    }
};

export default AppearanceFormatter;