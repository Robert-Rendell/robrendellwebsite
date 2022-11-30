import { ConfigService } from "../../services/config.service";

const localIp = "::1";

export const doNotSaveIps = () => [
  localIp,
  ...ConfigService.MyPublicIpAddress.split(","),
];
