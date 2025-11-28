import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mint';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  disabled,
  ...props 
}) => {
  
  const baseStyle = "relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: `glass-button text-white hover:scale-[1.02] active:scale-[0.98]`,
    secondary: "glass-card text-white hover:bg-white/15 hover:border-white/25",
    mint: "text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 backdrop-blur-xl hover:scale-[1.02] shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-white/20"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* Shine effect for mint buttons */}
      {variant === 'mint' && !disabled && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
      )}
      
      {icon && <span className="w-5 h-5">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
