import { useState, useEffect } from 'react';
import settingsService from '../services/settingsService.js';

/**
 * Hook pour accéder aux paramètres de la boutique depuis n'importe quel composant.
 * Les données sont mises en cache dans sessionStorage pour éviter des appels répétés.
 */
function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('site_settings');
    if (cached) {
      setSettings(JSON.parse(cached));
      setLoading(false);
      return;
    }

    settingsService.get()
      .then(data => {
        setSettings(data.settings);
        sessionStorage.setItem('site_settings', JSON.stringify(data.settings));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading, error };
}

export default useSettings;
