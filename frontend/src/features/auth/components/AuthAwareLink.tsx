import React, { useState } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthAwareLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  customMessage?: string;
  customTitle?: string;
}

export const AuthAwareLink: React.FC<AuthAwareLinkProps> = ({ 
  to, 
  customMessage, 
  customTitle,
  onClick, 
  children, 
  ...props 
}) => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowModal(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <Link to={to} onClick={handleClick} {...props}>
        {children}
      </Link>
      
      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={customTitle}
        message={customMessage}
      />
    </>
  );
};
