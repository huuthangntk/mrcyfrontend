// Extend the Window interface
declare global {
  interface Window {
    openLoginModal?: () => void;
    openRegisterModal?: () => void;
  }
}

export {}; 