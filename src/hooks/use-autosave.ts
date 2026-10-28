"use client";

import { useEffect, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";

export function useAutosave<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  storageKey: string,
  defaultValues: T,
  onSave?: (data: T) => Promise<void> | void
) {
  const { watch, reset, formState: { isDirty } } = form;

  const debouncedSave = useCallback(
    debounce(async (data: T) => {
      try {
        const dataToSave = JSON.stringify(data);
        localStorage.setItem(storageKey, dataToSave);
        
        if (onSave) {
          await onSave(data);
        }
      } catch (error) {
        console.error("Error saving to localStorage", error);
      }
    }, 1000), // Debounce with a 1-second delay
    [storageKey, onSave]
  );

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Deep merge parsed data with default values to ensure all keys are present
        const mergedData = { ...defaultValues, ...parsedData };
        reset(mergedData, { keepDefaultValues: true });
      }
    } catch (error) {
      console.error("Error loading from localStorage", error);
      reset(defaultValues);
    }
  }, [storageKey, reset, defaultValues]);

  // Watch for form changes and trigger the debounced save
  useEffect(() => {
    if (!isDirty) return;

    const subscription = watch((value) => {
      debouncedSave(value as T);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSave, isDirty]);

  return;
}
