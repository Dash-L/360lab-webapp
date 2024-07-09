import { createContext } from "react";
import { MpSdk } from "@matterport/sdk";

export const MpSdkContext = createContext<MpSdk | null>(null);
