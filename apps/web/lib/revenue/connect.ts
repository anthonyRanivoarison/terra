import { decrypt, encrypt } from "@/lib/crypto"
import {
  createPaddle,
  keyEnvironment,
  SITE_EVENTS,
  webhookDestination,
  type PaddleFactory,
} from "@/lib/revenue/paddle-client"
import {
  deleteConnection,
  getConnection,
  saveConnection,
  sitePublicId,
  type PaddleEnvironment,
} from "@/lib/revenue/store"

export class ConnectError extends Error {}

export async function connectPaddle(
  siteId: string,
  apiKey: string,
  environment: PaddleEnvironment,
  factory: PaddleFactory = createPaddle
): Promise<void> {
  const key = apiKey.trim()
  const detected = keyEnvironment(key)
  if (detected && detected !== environment) {
    throw new ConnectError(`This looks like a ${detected} API key.`)
  }
  const publicId = await sitePublicId(siteId)
  if (!publicId) throw new ConnectError("Site not found.")
  const paddle = factory(key, environment)
  try {
    await paddle.notificationSettings.list({ perPage: 1 })
  } catch {
    throw new ConnectError(
      "Paddle rejected this API key. It needs read access to transactions and adjustments, and write access to notification settings."
    )
  }
  const previous = await getConnection(siteId)
  if (previous) await removeNotification(previous, factory)
  const setting = await paddle.notificationSettings.create({
    description: `Terra revenue attribution (${publicId})`,
    destination: webhookDestination(publicId),
    subscribedEvents: [...SITE_EVENTS],
    type: "url",
    includeSensitiveFields: false,
    trafficSource: "all",
  })
  await saveConnection({
    siteId,
    environment,
    apiKeyEncrypted: encrypt(key),
    notificationId: setting.id,
    webhookSecretEncrypted: encrypt(setting.endpointSecretKey),
  })
}

async function removeNotification(
  connection: {
    apiKeyEncrypted: string
    environment: PaddleEnvironment
    notificationId: string
  },
  factory: PaddleFactory
) {
  try {
    const paddle = factory(
      decrypt(connection.apiKeyEncrypted),
      connection.environment
    )
    await paddle.notificationSettings.delete(connection.notificationId)
  } catch (error) {
    console.error("[revenue] could not delete Paddle notification", error)
  }
}

export async function disconnectPaddle(
  siteId: string,
  factory: PaddleFactory = createPaddle
): Promise<void> {
  const connection = await getConnection(siteId)
  if (!connection) return
  await removeNotification(connection, factory)
  await deleteConnection(siteId)
}
