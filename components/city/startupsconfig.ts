// FILE: components/city/startupsconfig.ts
import { Startup } from "./types";

export const startups: Startup[] = [
  {
    id: "street", // CHANGED BACK: Was "street-labs", must be "street" to match connections
    name: "Street Labs",
    district: "hq",
    description: "Building the ecosystem where founders go to accelerate their radical changes in the world.",
    gridPosition: [6, 6],
    color: "#ff8c00",
    link: "https://street.app",
    modelKey: "building-skyscraper-a",
    rotation: 0,
    highlight: true,
  },
  {
    id: "opendroids",
    name: "OpenDroids",
    district: "robotics",
    description: "Robotics Company out of San Francisco building at the frontier of humanoids.",
    gridPosition: [7, 5],
    color: "#00bfff",
    link: "https://opendroids.com",
    modelKey: "building-skyscraper-c",
    rotation: 0,
  },
  {
    id: "starfun",
    name: "StarFun",
    district: "gaming",
    description: "Imagine if Twitch, Kickstarter and the NASDAQ had a baby. A fundraising platform where founders raise capital in live, public token sales.",
    gridPosition: [7, 7],
    color: "#ffd700",
    link: "https://star.fun",
    modelKey: "building-skyscraper-e",
    rotation: -Math.PI / 2,
    scale: 0.75,
  },
  {
    id: "kled", // CHANGED BACK: Was "kled-ai", must be "kled" to match connections
    name: "Kled AI",
    district: "data",
    description: "Data Marketplace where everyday citizens earn money for their content. Enabling a whole new job category in third world countries: The data seller.",
    gridPosition: [5, 5],
    color: "#9932cc",
    link: "https://kled.ai",
    modelKey: "building-skyscraper-b",
    rotation: Math.PI / 2,
  },
  {
    id: "noice",
    name: "Noice",
    district: "experimental",
    description: "Accelerator and Launchpad on Base where you can IPO from your desk. Backed by Coinbase and other cool angels.",
    gridPosition: [5, 7],
    color: "#ff4500",
    link: "https://noice.so",
    modelKey: "building-skyscraper-d",
    rotation: Math.PI,
    scale: 0.7,
  }
];
