export const enum ProcessMessagesType {
  EXITING = "EXITING",
  FORCE_GRACEFUL_SHUTDOWN = "FORCE_GRACEFUL_SHUTDOWN",
}

export type ProcessMessage = {
  status: ProcessMessagesType;
};
