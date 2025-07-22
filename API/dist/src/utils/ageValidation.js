/**
 * Calculate a person's current age based on their birth date
 * @param birthDate - The person's birth date
 * @param currentDate - Optional current date (defaults to now)
 * @returns The person's current age in years
 */
export const calculateAge = (birthDate, currentDate = new Date()) => {
    const birth = new Date(birthDate);
    const current = new Date(currentDate);
    let age = current.getFullYear() - birth.getFullYear();
    const monthDiff = current.getMonth() - birth.getMonth();
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};
/**
 * Check if a player is eligible for a session based on age range
 * @param playerBirthDate - The player's birth date
 * @param sessionMinAge - Minimum age for the session
 * @param sessionMaxAge - Maximum age for the session
 * @param currentDate - Optional current date (defaults to now)
 * @returns True if player is eligible, false otherwise
 */
export const isPlayerEligibleForAgeRange = (playerBirthDate, sessionMinAge, sessionMaxAge, currentDate = new Date()) => {
    const playerAge = calculateAge(playerBirthDate, currentDate);
    return playerAge >= sessionMinAge && playerAge <= sessionMaxAge;
};
/**
 * Check if a player is eligible for a session (handles both age range and birth year)
 * @param playerBirthDate - The player's birth date
 * @param session - The session object
 * @param currentDate - Optional current date (defaults to now)
 * @returns True if player is eligible, false otherwise
 */
export const isPlayerEligibleForSession = (playerBirthDate, session, currentDate = new Date()) => {
    // If session has age range, use that
    if (session.ageRange && session.ageRange.minAge !== undefined && session.ageRange.maxAge !== undefined) {
        return isPlayerEligibleForAgeRange(playerBirthDate, session.ageRange.minAge, session.ageRange.maxAge, currentDate);
    }
    // Fallback to birth year if age range not set
    if (session.birthYear) {
        const playerBirthYear = playerBirthDate.getFullYear();
        return playerBirthYear === session.birthYear;
    }
    // If no age restrictions, allow all players
    return true;
};
/**
 * Convert age range string to ageRange object
 * @param ageRangeString - String like "10-12" or "18+"
 * @returns Object with minAge and maxAge
 */
export const parseAgeRange = (ageRangeString) => {
    const range = ageRangeString.toLowerCase().trim();
    // Handle "18+" format
    if (range.endsWith('+')) {
        const minAge = parseInt(range.slice(0, -1));
        return { minAge, maxAge: 100 }; // Cap at 100 for practical purposes
    }
    // Handle "10-12" format
    const parts = range.split('-');
    if (parts.length === 2) {
        const minAge = parseInt(parts[0]);
        const maxAge = parseInt(parts[1]);
        return { minAge, maxAge };
    }
    // Handle single age like "10"
    const singleAge = parseInt(range);
    if (!isNaN(singleAge)) {
        return { minAge: singleAge, maxAge: singleAge };
    }
    // Default fallback
    return { minAge: 0, maxAge: 100 };
};
