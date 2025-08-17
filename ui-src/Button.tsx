import React from 'react';
import './Button.css';

const Button = ({
  children,
  type,
  icon,
  ...props
}: {
  children?: React.ReactNode;
  type?: string;
  icon?: boolean;
} & React.ButtonHTMLAttributes) => {
  return (
    <button
      className={`c-button ${type ? `c-button--${type}` : ""} ${icon ? `c-button--icon` : ""}`}
      {...props}>
      {children}
    </button>
  )
}

export default Button;