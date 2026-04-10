import { useEffect, useState, useRef } from "react";

export default function useFormProtection(formKey, formData) {
  const [isDirty, setIsDirty] = useState(false);
  const initialLoad = useRef(true);

  // Detect changes & save
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (formData && Object.keys(formData).length > 0) {
      setIsDirty(true);
      localStorage.setItem(formKey, JSON.stringify(formData));
    }
  }, [formData, formKey]);

  // Restore saved data
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(formKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem(formKey);
    setIsDirty(false);
  };

  // Confirm before close
  const confirmClose = () => {
    if (!isDirty) return true;
    return window.confirm(
      "You have unsaved changes. Are you sure you want to leave?"
    );
  };

  // Browser refresh / tab close protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return {
    isDirty,
    confirmClose,
    getSavedData,
    clearSavedData,
  };
}