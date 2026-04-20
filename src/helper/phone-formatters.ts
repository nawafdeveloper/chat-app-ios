export const formatPhoneNumber = (phoneNumber: string | null | undefined) => {
    if (!phoneNumber) return '';

    // Remove all spaces and special characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    // Extract country code (1-3 digits after +)
    const countryMatch = cleaned.match(/^\+\d{1,3}/);
    if (!countryMatch) return phoneNumber;

    const countryCode = countryMatch[0];
    const nationalNumber = cleaned.slice(countryCode.length);

    // Country-specific formatting patterns
    const formats = {
        // North America
        '+1': (num: string) => {
            if (num.length === 10) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            if (num.length === 11) return `${countryCode} ${num.slice(1, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },

        // South America
        '+54': (num: string) => { // Argentina
            if (num.length === 10) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+55': (num: string) => { // Brazil
            if (num.length === 11) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 7)} ${num.slice(7)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },

        // Europe
        '+33': (num: string) => { // France
            return `${countryCode} ${num.match(/.{1,2}/g)?.join(' ') || num}`;
        },
        '+34': (num: string) => { // Spain
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+39': (num: string) => { // Italy
            if (num.length === 10) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+44': (num: string) => { // UK
            if (num.length === 10) return `${countryCode} ${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
            return `${countryCode} ${num.match(/.{1,4}/g)?.join(' ') || num}`;
        },
        '+49': (num: string) => { // Germany
            if (num.length === 11) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },

        // Middle East
        '+966': (num: string) => { // Saudi Arabia
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+971': (num: string) => { // UAE
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+972': (num: string) => { // Israel
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+965': (num: string) => { // Kuwait
            if (num.length === 8) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+974': (num: string) => { // Qatar
            if (num.length === 8) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },

        // Asia
        '+81': (num: string) => { // Japan
            if (num.length === 10) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+86': (num: string) => { // China
            if (num.length === 11) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 7)} ${num.slice(7)}`;
            return `${countryCode} ${num.match(/.{1,4}/g)?.join(' ') || num}`;
        },
        '+91': (num: string) => { // India
            if (num.length === 10) return `${countryCode} ${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
            return `${countryCode} ${num.match(/.{1,4}/g)?.join(' ') || num}`;
        },

        // Africa
        '+20': (num: string) => { // Egypt
            if (num.length === 10) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+27': (num: string) => { // South Africa
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },

        // Australia/Oceania
        '+61': (num: string) => { // Australia
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            if (num.length === 10) return `${countryCode} ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
        '+64': (num: string) => { // New Zealand
            if (num.length === 9) return `${countryCode} ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            return `${countryCode} ${num.match(/.{1,3}/g)?.join(' ') || num}`;
        },
    };

    // Dynamic intelligent formatting for any country
    const length = nationalNumber.length;

    // Common international patterns
    if (length === 7) {
        return `${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`;
    } else if (length === 8) {
        return `${countryCode} ${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4)}`;
    } else if (length === 9) {
        return `${countryCode} ${nationalNumber.slice(0, 2)} ${nationalNumber.slice(2, 5)} ${nationalNumber.slice(5)}`;
    } else if (length === 10) {
        return `${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
    } else if (length === 11) {
        return `${countryCode} ${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4, 7)} ${nationalNumber.slice(7)}`;
    } else if (length === 12) {
        return `${countryCode} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 9)} ${nationalNumber.slice(9)}`;
    } else {
        // Fallback: group in chunks of 3-4 digits
        const groups = [];
        let remaining = nationalNumber;

        while (remaining.length > 4) {
            groups.push(remaining.slice(0, 3));
            remaining = remaining.slice(3);
        }
        groups.push(remaining);

        return `${countryCode} ${groups.join(' ')}`;
    }
};