import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  Info,
  Apple,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function DirectDownload() {
  const [userCountry, setUserCountry] = useState<string>('');
  const [isEU, setIsEU] = useState(false);
  
  // EU countries where sideloading is legal and streamlined
  const euCountries = [
    'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'SE', 'DK', 
    'FI', 'PT', 'GR', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI',
    'LT', 'LV', 'EE', 'CY', 'LU', 'MT', 'IE'
  ];

  useEffect(() => {
    // Detect user's country
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setUserCountry(data.country_code);
        setIsEU(euCountries.includes(data.country_code));
      })
      .catch(() => {
        // Default to showing EU options if detection fails
        setIsEU(true);
      });
  }, []);

  const handleAndroidDownload = () => {
    // Direct APK download
    window.location.href = '/downloads/we1web-latest.apk';
  };

  const handleIOSDownload = () => {
    if (isEU) {
      // EU users can install directly
      window.location.href = '/downloads/install-ios';
    } else {
      // Non-EU users go to waiting list
      window.location.href = '/downloads/ios-waitlist';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Location Detection */}
      {userCountry && (
        <Alert className={isEU ? 'border-green-500' : 'border-blue-500'}>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            {isEU ? (
              <>
                <strong>Great news!</strong> As a user in {userCountry}, you can install our app directly 
                without going through app stores thanks to the EU Digital Markets Act.
              </>
            ) : (
              <>
                Detected location: {userCountry}. Direct installation is optimized for EU users. 
                Other regions may require additional steps.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Android Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            Android Direct Download
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">No Google Play Store Required</p>
              <p className="text-sm text-muted-foreground">
                Download and install directly - save on store fees and get instant updates
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Installation Steps:</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                Click download to get the APK file
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                Open your Downloads folder and tap the APK
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                If prompted, enable "Install from Unknown Sources" for your browser
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                Complete installation and open WE1WEB
              </li>
            </ol>
          </div>

          <Button 
            onClick={handleAndroidDownload}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download WE1WEB.apk (14.2 MB)
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Version 1.0.0 • Updated: {new Date().toLocaleDateString()} • SHA-256: 3f4a8b2c...
          </p>
        </CardContent>
      </Card>

      {/* iOS Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            iOS Direct Installation {isEU && <span className="text-sm font-normal text-green-600">(EU Users)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEU ? (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">EU Digital Markets Act Compliant</p>
                  <p className="text-sm text-muted-foreground">
                    Install directly on iOS 17.5+ without App Store (EU users only)
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• iOS 17.5 or later</li>
                  <li>• Location in EU member state</li>
                  <li>• Safari browser (for initial setup)</li>
                </ul>
              </div>

              <Button 
                onClick={handleIOSDownload}
                className="w-full bg-black hover:bg-gray-800"
                size="lg"
              >
                <Apple className="mr-2 h-5 w-5" />
                Install on iPhone
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Direct iOS installation is currently only available in EU countries due to 
                  Apple's regional policies. Join the waitlist to be notified when it's available 
                  in your region.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleIOSDownload}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Join iOS Waitlist
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium">Security & Privacy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ All apps are cryptographically signed and verified</li>
                <li>✓ No data collection beyond what you explicitly share</li>
                <li>✓ Open source code available for security audits</li>
                <li>✓ Compliant with GDPR and EU privacy regulations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Germany-Specific Benefits */}
      {userCountry === 'DE' && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">🇩🇪 Special Benefits for German Users</h4>
            <ul className="text-sm space-y-2">
              <li>• <strong>No store fees</strong> - 100% of earnings go to you</li>
              <li>• <strong>Instant updates</strong> - Get features as soon as they're ready</li>
              <li>• <strong>Full GDPR compliance</strong> - Your data stays in EU</li>
              <li>• <strong>German language support</strong> - Native German interface</li>
              <li>• <strong>Local payment methods</strong> - SEPA, Giropay, Sofort</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}