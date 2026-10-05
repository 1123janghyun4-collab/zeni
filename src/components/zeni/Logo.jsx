import React from "react";

export default function Logo({ size = "md", className = "" }) {
  const textSize = size === "sm" ? "text-[16px]" : size === "lg" ? "text-[26px]" : "text-[20px]";
  const imgSize = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-7 h-7" : "w-6 h-6";

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <img src="/logo.png" alt="zeni" className={imgSize} draggable={false} />
      <span className={`${textSize} font-extrabold tracking-tight text-[#1A1A1A]`}>
        zeni
      </span>
    </div>
  );
}