/**
 * Human-Friendly Error Parser for Focus Flow
 * Converts raw technical Firebase, network, or JavaScript errors into 
 * clear, actionable, and encouraging user messages.
 */

export interface ParsedError {
  title: string;
  message: string;
  isRetryable: boolean;
}

export function parseAppError(error: unknown, context: string = 'operation'): ParsedError {
  if (!error) {
    return {
      title: 'Action Failed',
      message: `An unexpected issue occurred while processing your ${context}. Please try again.`,
      isRetryable: true,
    };
  }

  const rawMessage = error instanceof Error ? error.message : String(error);

  // Check for JSON stringified FirestoreErrorInfo from errorHandler.ts
  if (rawMessage.startsWith('{') && rawMessage.includes('"operationType"')) {
    try {
      const info = JSON.parse(rawMessage);
      if (info.error?.includes('insufficient permissions') || info.error?.includes('permission-denied')) {
        return {
          title: 'Database Access Notice',
          message: 'Your account session is authenticating or lacks write access for this record. Please verify your connection or sign in again.',
          isRetryable: true,
        };
      }
      if (info.error?.includes('unavailable') || info.error?.includes('network')) {
        return {
          title: 'Connection Interrupted',
          message: 'Could not connect to the cloud database. Your changes will sync automatically once connectivity is restored.',
          isRetryable: true,
        };
      }
    } catch (_) {
      // Fall through if not valid JSON
    }
  }

  // Firebase Auth Error Codes
  if (rawMessage.includes('auth/invalid-credential') || rawMessage.includes('auth/wrong-password') || rawMessage.includes('auth/user-not-found')) {
    return {
      title: 'Invalid Credentials',
      message: 'The email address or password you entered is incorrect. Please check your credentials and try again.',
      isRetryable: false,
    };
  }

  if (rawMessage.includes('auth/email-already-in-use')) {
    return {
      title: 'Email Already Registered',
      message: 'An account with this email address already exists. Please sign in instead or reset your password.',
      isRetryable: false,
    };
  }

  if (rawMessage.includes('auth/weak-password')) {
    return {
      title: 'Password Too Short',
      message: 'Please choose a password with at least 6 characters for security.',
      isRetryable: false,
    };
  }

  if (rawMessage.includes('auth/invalid-email')) {
    return {
      title: 'Invalid Email Address',
      message: 'Please enter a valid email address (e.g., student@university.edu).',
      isRetryable: false,
    };
  }

  if (rawMessage.includes('auth/popup-closed-by-user')) {
    return {
      title: 'Sign-in Cancelled',
      message: 'The sign-in popup was closed before finishing authentication.',
      isRetryable: true,
    };
  }

  if (rawMessage.includes('auth/popup-blocked')) {
    return {
      title: 'Popup Blocked',
      message: 'Your browser blocked the authentication popup. Please allow popups for this site or use email sign-in.',
      isRetryable: true,
    };
  }

  if (rawMessage.includes('auth/too-many-requests')) {
    return {
      title: 'Too Many Attempts',
      message: 'Access to this account has been temporarily disabled due to many failed attempts. Please wait a moment or reset your password.',
      isRetryable: true,
    };
  }

  if (rawMessage.includes('network-request-failed') || rawMessage.includes('Failed to fetch') || rawMessage.includes('NetworkError')) {
    return {
      title: 'Network Issue',
      message: 'Unable to reach the server. Please check your internet connection and try again.',
      isRetryable: true,
    };
  }

  if (rawMessage.includes('permission-denied') || rawMessage.includes('Missing or insufficient permissions')) {
    return {
      title: 'Access Restricted',
      message: 'You must be signed in to modify this study data. Please log in to your account.',
      isRetryable: true,
    };
  }

  if (rawMessage.includes('quota') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      title: 'Service Busy',
      message: 'The service is currently handling high traffic. Please try again in a few seconds.',
      isRetryable: true,
    };
  }

  // Default fallback with context
  return {
    title: 'Unable to Complete Action',
    message: rawMessage.length < 120 && !rawMessage.includes('at ') 
      ? rawMessage 
      : `An unexpected issue occurred while processing your ${context}. Please try again.`,
    isRetryable: true,
  };
}
