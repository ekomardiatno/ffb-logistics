// client/src/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";

/**
 * Typed hooks for Redux Toolkit + TypeScript
 *
 * useAppDispatch: typed dispatch so async thunks have proper types
 * useAppSelector: typed selector for RootState
 */

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
