// FILE: components/city/connectionsconfig.ts

export interface ConnectionData {
  id: string;
  startupAId: string;
  startupBId: string;
  title: string;
  description: string;
}

export const connections: ConnectionData[] = [
  {
    id: "kled-opendroids-deal",
    startupAId: "kled", 
    startupBId: "opendroids",
    title: "Strategic Partnership",
    description: "Announcement: Kled AI and OpenDroids partner in mutual data deal to accelerate humanoid robotics learning."
  },
  {
    id: "street-noice",
    startupAId: "street",
    startupBId: "noice",
    title: "ERC-S Integration",
    description: "Street announces ERC-S plug & playability to Noice for easy ERC-S integration."
  },
  {
    id: "street-starfun",
    startupAId: "street",
    startupBId: "starfun",
    title: "ERC-S Integration",
    description: "Street announces ERC-S plug & playability to StarFun for easy ERC-S integration."
  }
];
