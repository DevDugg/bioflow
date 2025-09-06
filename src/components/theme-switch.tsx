"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-14" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      onClick={toggleTheme}
      className="flex h-8 w-14 cursor-pointer items-center rounded-full bg-muted p-1"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`h-6 w-6 rounded-full bg-background ${
          theme === "light" ? "ml-0" : "ml-6"
        }`}
      >
        {theme === "light" ? (
          <Sun className="h-full w-full p-1" />
        ) : (
          <Moon className="h-full w-full p-1" />
        )}
      </motion.div>
    </div>
  );
}
