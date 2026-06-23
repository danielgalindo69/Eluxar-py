import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface Props {
  children?: React.ReactNode;
  featureName?: string;
}

export const FeatureProtectedRoute: React.FC<Props> = ({ children, featureName }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  if (!isAuthenticated) {
    const handleClose = () => {
      setShowModal(false);
      navigate('/');
    };

    return (
      <div className="min-h-screen bg-white dark:bg-[var(--bg-base)] flex items-center justify-center">
        <AuthModal 
          isOpen={showModal} 
          onClose={handleClose} 
          title="Inicia Sesión Requerido"
          message={`Inicia sesión para acceder a ${featureName ? featureName : 'esta función'}.`}
        />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
