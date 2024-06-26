import { Operation } from "./operations/operations";

export interface Command {
  operation: Operation;
  arguments: number[];
  start: [number, number];
  end: [number, number];
}
