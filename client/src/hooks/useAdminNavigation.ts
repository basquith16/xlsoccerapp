import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useAdminNavigation = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('sessions');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['sessions', 'users', 'billing', 'analytics', 'pages', 'settings'].includes(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const editPageId = searchParams.get('editPage');

  return {
    activeSection,
    setActiveSection,
    editPageId
  };
};