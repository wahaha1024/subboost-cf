import type { ConfigActions, ConfigState } from "./definitions";

export type StoreState = ConfigState & ConfigActions;
export type SetState = (
  partial:
    | Partial<StoreState>
    | ((state: StoreState) => Partial<StoreState> | StoreState),
  replace?: false
) => void;
export type GetState = () => StoreState;
export type SetAndGenerateConfig = (
  updater: (state: StoreState) => Partial<StoreState> | StoreState
) => void;

