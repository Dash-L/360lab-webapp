import { createContext } from "react";
import type { MpSdk } from "@matterport/sdk";

export const MpSdkContext = createContext<MpSdk | null>(null);
