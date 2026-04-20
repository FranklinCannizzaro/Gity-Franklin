declare global {
    interface Window {
      paypal: any;  // Or use a more specific type for PayPal objects, if available
    }
  }
  
  export {};
  