export type PatchChannelFormat = 'RGB' | 'RGBW';
export type Assignment = { pixel: number; universeOffset: number; slot: number; channels: number };
export declare function channelsPerPixel(format: PatchChannelFormat): number;
export declare function patchFootprint(pixels: number, format: PatchChannelFormat, firstSlot?: number): Assignment[];
export declare function describePatch(pixels: number, format: PatchChannelFormat, firstSlot?: number): {
  pixels: number; format: PatchChannelFormat; channels: number; universesUsed: number; assignments: Assignment[];
};
