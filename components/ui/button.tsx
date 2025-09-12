import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-3 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses =
    variant == "outline"
      ? "border border-gray-400 text-gray-800 bg-transparent hover:bg-gray-100"
      : "bg-gray-800 text-gray-100 hover:bg-gray-700";

  return (
    <button
      className={baseClasses + " " + variantClasses + " " + className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
