import { AsyncLocalStorage } from "node:async_hooks";
import type { ReturnTypeOfLogger } from "./logger";

interface RequestContext {
  requestId: string;
  logger: ReturnTypeOfLogger;
}

//requests can run concurrently and dont overwrite each other's context
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = () => requestContext.getStore();

export const getRequestId = () => getRequestContext()?.requestId;
