// FILE: components/city/types.ts
export interface Startup {
    id: string;
    name: string;
    district: string;
    gridPosition: [number, number]; // [x, z] on the grid
    color: string;
    link: string;
    highlight?: boolean;
    modelKey: string;
    rotation: number;
    description: string;
    scale?: number; // New optional property to resize buildings
}