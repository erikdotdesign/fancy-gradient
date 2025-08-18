import React from 'react';
import './Button.css';

const Button = ({
  children,
  modifier,
  ...props
}: {
  children?: React.ReactNode;
  modifier?: string | string[];
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const modifierClasses = Array.isArray(modifier)
    ? modifier.map((m) => `c-button--${m}`).join(' ')
    : modifier
    ? `c-button--${modifier}`
    : '';
  return (
    <button
      className={`c-button ${modifierClasses}`}
      {...props}>
      {children}
    </button>
  )
}

export default Button;