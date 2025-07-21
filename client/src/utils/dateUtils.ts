/**
 * Format a date string to a readable format
 * @param dateString - The date string to format
 * @param format - The format to use ('short', 'long', 'month-day', 'full')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'long' | 'month-day' | 'full' = 'short'): string => {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'month-day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      
      case 'full':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      default:
        return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date range (multiple dates)
 * @param dateString - Comma-separated date string or array of dates
 * @returns Formatted date range string
 */
export const formatDateRange = (dateString: string): string => {
  if (!dateString) return 'TBD';
  
  try {
    // Handle comma-separated dates
    const dates = dateString.split(',').map(d => d.trim());
    
    if (dates.length === 1) {
      return formatDate(dates[0], 'short');
    }
    
    if (dates.length === 2) {
      const startDate = formatDate(dates[0], 'month-day');
      const endDate = formatDate(dates[1], 'short');
      return `${startDate} - ${endDate}`;
    }
    
    // For multiple dates, show first and last
    const firstDate = formatDate(dates[0], 'month-day');
    const lastDate = formatDate(dates[dates.length - 1], 'short');
    return `${firstDate} - ${lastDate}`;
    
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Invalid Date Range';
  }
};

/**
 * Check if a date is in the past
 * @param dateString - The date string to check
 * @returns boolean
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return date < today;
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time (e.g., "2 days ago", "next week")
 * @param dateString - The date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `In ${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      return formatDate(dateString, 'short');
    }
  } catch (error) {
    return 'Invalid Date';
  }
}; 