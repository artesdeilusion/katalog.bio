import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { CookieSettings, saveCookieSettings, getCookieSettings, resetCookieConsent } from '../utils/cookie-manager';
import { Cookie, BarChart3, Settings, User } from 'lucide-react';

interface CookieSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CookieSettingsDialog({ open, onClose, onSave }: CookieSettingsDialogProps) {
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    analytics: false,
    functional: false,
    preferences: false,
  });

  useEffect(() => {
    if (open) {
      setSettings(getCookieSettings());
    }
  }, [open]);

  const handleSave = () => {
    saveCookieSettings(settings);
    onSave();
    onClose();
  };

  const handleAcceptAll = () => {
    setSettings({
      necessary: true,
      analytics: true,
      functional: true,
      preferences: true,
    });
  };

  const handleRejectAll = () => {
    setSettings({
      necessary: true,
      analytics: false,
      functional: false,
      preferences: false,
    });
  };

  const handleReset = () => {
    resetCookieConsent();
    setSettings({
      necessary: true,
      analytics: false,
      functional: false,
      preferences: false,
    });
  };

  const cookieCategories = [
    {
      key: 'necessary' as const,
      title: 'Gerekli Çerezler',
      description: 'Web sitesinin temel işlevleri için zorunlu çerezler. Bu çerezler devre dışı bırakılamaz.',
      icon: Cookie,
      required: true,
    },
    {
      key: 'analytics' as const,
      title: 'Analytics Çerezleri',
      description: 'Mağaza performansını ve kullanıcı davranışlarını analiz etmek için kullanılır.',
      icon: BarChart3,
      required: false,
    },
    {
      key: 'functional' as const,
      title: 'Fonksiyonel Çerezler',
      description: 'Gelişmiş özellikler ve kişiselleştirme için kullanılır.',
      icon: Settings,
      required: false,
    },
    {
      key: 'preferences' as const,
      title: 'Tercih Çerezleri',
      description: 'Kullanıcı tercihlerini ve ayarlarını hatırlamak için kullanılır.',
      icon: User,
      required: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="w-5 h-5" />
            Çerez Ayarları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p>
              Bu web sitesi deneyiminizi geliştirmek için farklı türde çerezler kullanır. 
              Aşağıdaki kategorilerden istediğinizi seçebilirsiniz.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={handleAcceptAll} variant="outline" size="sm">
              Tümünü Kabul Et
            </Button>
            <Button onClick={handleRejectAll} variant="outline" size="sm">
              Tümünü Reddet
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Sıfırla
            </Button>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {cookieCategories.map((category) => (
              <div key={category.key} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium text-foreground">
                          {category.title}
                        </Label>
                        {category.required && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Zorunlu
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <Switch
                      checked={settings[category.key]}
                      onCheckedChange={(checked: boolean) => {
                        if (category.required) return; // Cannot disable necessary cookies
                        setSettings(prev => ({
                          ...prev,
                          [category.key]: checked,
                        }));
                      }}
                      disabled={category.required}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Önemli Bilgiler:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Çerez tercihleriniz tarayıcınızda saklanır</li>
              <li>• Tercihlerinizi istediğiniz zaman değiştirebilirsiniz</li>
              <li>• Gerekli çerezler her zaman aktif kalır</li>
              <li>• Çerezleri devre dışı bırakırsanız bazı özellikler çalışmayabilir</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button onClick={onClose} variant="outline">
              İptal
            </Button>
            <Button onClick={handleSave}>
              Ayarları Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 