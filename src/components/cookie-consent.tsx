import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  const handleSettings = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
         
          
          <div className="flex-1">
 
            <div className="flex items-start justify-between mb-2">
 
<h3 className="text-lg font-semibold text-foreground"> Çerez Kullanımı</h3>
        <button
                onClick={handleSettings}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Bu web sitesi deneyiminizi geliştirmek için çerezler kullanır. 
              Analytics ve performans verilerini toplamak için gerekli çerezler kullanılmaktadır.
            </p>

            {showDetails && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Kullanılan Çerezler:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Analytics Çerezleri:</strong> Mağaza performansını takip etmek için</li>
                  <li>• <strong>Fonksiyonel Çerezler:</strong> Site işlevselliği için gerekli</li>
                  <li>• <strong>Tercih Çerezleri:</strong> Kullanıcı ayarlarını hatırlamak için</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAccept} className="flex-1">
                Tümünü Kabul Et
              </Button>
              <Button onClick={handleDecline} variant="outline" className="flex-1">
                Sadece Gerekli
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 