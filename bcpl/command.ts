import type { Op } from "./operations/operations";

export interface Command {
  operation: Op;
  arguments: number[];
}
