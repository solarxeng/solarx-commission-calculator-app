"use client";
import React from "react";

export function Input({
  type = "text",
  value,
  onChange,
  disabled,
  step,
  min,
  max,
}: {
  type?: string;
  value?: any;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      step={step}
      min={min}
      max={max}
      style={{
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        width: "100%",
        backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
      }}
    />
  );
}
