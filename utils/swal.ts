import Swal from "sweetalert2";

// Determine current theme
const getTheme = (): "light" | "dark" => {
  if (typeof document !== "undefined") {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }
  return "light";
};

// Get theme-aware colors for SweetAlert2
const getThemedColors = () => {
  const isDark = getTheme() === "dark";

  return {
    background: isDark ? "#1a1a1a" : "#ffffff",
    color: isDark ? "#e5e5e5" : "#171717",
    confirmButtonColor: isDark ? "#3b82f6" : "#2563eb",
    cancelButtonColor: isDark ? "#ef4444" : "#dc2626",
    inputBackground: isDark ? "#262626" : "#ffffff",
    inputBorder: isDark ? "#404040" : "#d4d4d4",
  };
};

// Show a themed SweetAlert2 popup
export const showAlert = (
  title: string,
  text: string,
  icon: "success" | "error" | "warning" | "info" | "question"
) => {
  const colors = getThemedColors();

  return Swal.fire({
    title,
    text,
    icon,
    background: colors.background,
    color: colors.color,
    confirmButtonColor: colors.confirmButtonColor,
    customClass: {
      popup: "themed-swal",
    },
  });
};

// Show a themed confirmation dialog
export const showConfirm = (
  title: string,
  text: string,
  confirmButtonText: string = "Yes",
  cancelButtonText: string = "No"
) => {
  const colors = getThemedColors();

  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    background: colors.background,
    color: colors.color,
    confirmButtonColor: colors.confirmButtonColor,
    cancelButtonColor: colors.cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: "themed-swal",
    },
  });
};

// Show a themed SweetAlert2 with custom options
export const showThemedSwal = (options: any) => {
  const colors = getThemedColors();

  return Swal.fire({
    ...options,
    background: options.background || colors.background,
    color: options.color || colors.color,
    confirmButtonColor: options.confirmButtonColor || colors.confirmButtonColor,
    cancelButtonColor: options.cancelButtonColor || colors.cancelButtonColor,
    customClass: {
      ...options.customClass,
      popup: `themed-swal ${options.customClass?.popup || ""}`,
    },
  });
};
