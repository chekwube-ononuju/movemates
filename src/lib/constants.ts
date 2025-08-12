// Application constants

// Platform fee percentage charged to helpers
export const PLATFORM_FEE_PERCENTAGE = 10; // 10% of the transaction amount

// Payment processing options
export const PAYMENT_METHODS = [
  { id: 'venmo', name: 'Venmo', icon: 'venmo.svg' },
  { id: 'cashapp', name: 'Cash App', icon: 'cashapp.svg' },
  { id: 'paypal', name: 'PayPal', icon: 'paypal.svg' },
  { id: 'zelle', name: 'Zelle', icon: 'zelle.svg' },
];

// Helper application settings
export const HELPER_MIN_AGE = 18;
export const HELPER_MAX_DISTANCE_MILES = 25;