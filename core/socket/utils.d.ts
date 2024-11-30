import { Socket } from "socket.io";

export function getCallback(any: any[]): (...args: any[]) => void;

export function socketHandler(socket: (socket: Socket) => void): (socket: Socket) => void;
