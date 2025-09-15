"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./layout/navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on login page
  if (pathname === "/login") {
    return null;
  }
  
  return <Navbar />;
}
