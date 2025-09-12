"use client";
import React from "react";

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "1rem",
        backgroundColor: "var(--card-bg, #ffffff)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: "0.5rem" }}>{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>{children}</h2>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
