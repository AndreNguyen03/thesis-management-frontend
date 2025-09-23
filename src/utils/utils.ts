import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UAParser } from "ua-parser-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getDeviceInfo = () => {
    const parser = new UAParser()
    const result = parser.getResult()

    return `${result.browser.name} ${result.browser.version} - ${result.os.name} ${result.os.version} - ${result.device.model || "Desktop"} - UA: ${result.ua}`;
}