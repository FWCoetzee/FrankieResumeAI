'use client';

import { useState } from 'react';
import {
  FirestoreError,
} from 'firebase/firestore';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  setData: React.Dispatch<React.SetStateAction<WithId<T>[] | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<FirestoreError | Error | null>>;
}

/**
 * React hook to manage state for a Firestore collection.
 * It no longer creates the subscription itself. The subscription logic
 * should be handled in the component using this hook via useEffect.
 * 
 * @template T Optional type for document data. Defaults to any.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error, and state setters.
 */
export function useCollection<T = any>(): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  return { data, isLoading, error, setData, setIsLoading, setError };
}
