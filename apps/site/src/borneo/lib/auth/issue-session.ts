import { createSessionToken } from "@borneo/lib/auth/session";
import { issueDeviceAuthToken } from "@borneo/lib/auth/device-token";

export async function issueParticipantSession(participant: {
  id: string;
  email: string;
}): Promise<{ sessionToken: string; deviceToken: string }> {
  const [sessionToken, deviceToken] = await Promise.all([
    createSessionToken({ sub: participant.id, email: participant.email }),
    issueDeviceAuthToken(participant.id),
  ]);

  return { sessionToken, deviceToken };
}
