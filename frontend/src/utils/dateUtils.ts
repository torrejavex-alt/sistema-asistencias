// Helper function to parse ISO date strings as local dates
// This prevents timezone conversion issues that cause dates to shift by one day
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Format a date string to local date string (dd/mm/yyyy)
export const formatLocalDate = (dateStr: string): string => {
    return parseLocalDate(dateStr).toLocaleDateString('es-ES');
};

// Get day of month from date string
export const getLocalDay = (dateStr: string): number => {
    return parseLocalDate(dateStr).getDate();
};

// Get year from date string
export const getLocalYear = (dateStr: string): number => {
    return parseLocalDate(dateStr).getFullYear();
};

// Get month (0-11) from date string
export const getLocalMonth = (dateStr: string): number => {
    return parseLocalDate(dateStr).getMonth();
};
