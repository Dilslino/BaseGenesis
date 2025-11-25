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
  
  const baseStyle = "relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: "bg-base-blue text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)] border border-blue-400/20",
    secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
    mint: "text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-white/10"
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
