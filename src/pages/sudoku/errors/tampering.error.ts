export default class TamperingError extends Error {
  constructor(tamperingMessage: string) {
    super(`Tampering Detected: ${tamperingMessage}`);
  }
}
