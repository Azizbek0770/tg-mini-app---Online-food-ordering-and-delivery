// Telegram WebApp integration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          chat_type?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          hint_color?: string;
          bg_color?: string;
          text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        expand(): void;
        close(): void;
        ready(): void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        sendData(data: string): void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

class TelegramWebApp {
  private webApp = window.Telegram?.WebApp;

  constructor() {
    if (this.isAvailable()) {
      this.webApp?.ready();
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  }

  getUser(): TelegramUser | null {
    if (!this.isAvailable()) return null;
    return this.webApp?.initDataUnsafe.user || null;
  }

  getTheme(): 'light' | 'dark' {
    if (!this.isAvailable()) return 'light';
    return this.webApp?.colorScheme || 'light';
  }

  expand(): void {
    if (this.isAvailable()) {
      this.webApp?.expand();
    }
  }

  close(): void {
    if (this.isAvailable()) {
      this.webApp?.close();
    }
  }

  showMainButton(text: string, onClick: () => void): void {
    if (!this.isAvailable()) return;
    
    const mainButton = this.webApp?.MainButton;
    if (mainButton) {
      mainButton.setText(text);
      mainButton.onClick(onClick);
      mainButton.show();
    }
  }

  hideMainButton(): void {
    if (!this.isAvailable()) return;
    this.webApp?.MainButton.hide();
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    if (!this.isAvailable()) return;
    
    const haptic = this.webApp?.HapticFeedback;
    if (!haptic) return;

    if (['light', 'medium', 'heavy'].includes(type)) {
      haptic.impactOccurred(type as 'light' | 'medium' | 'heavy');
    } else {
      haptic.notificationOccurred(type as 'success' | 'warning' | 'error');
    }
  }

  sendData(data: any): void {
    if (!this.isAvailable()) return;
    this.webApp?.sendData(JSON.stringify(data));
  }

  isMobile(): boolean {
    if (!this.isAvailable()) return window.innerWidth < 768;
    return ['android', 'ios'].includes(this.webApp?.platform || '');
  }
}

export const telegram = new TelegramWebApp();
