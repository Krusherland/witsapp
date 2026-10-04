// Converts between the backend's BodyResponse/BodyRequest shape (enums, split position)
// and the frontend store's Body shape (lowercase strings, position array).

export function fromServerBody(b) {
  return {
    id: b.id,
    name: b.name,
    kind: b.kind.toLowerCase(),
    role: b.role ?? undefined,
    relation: b.relation ? b.relation.toLowerCase() : undefined,
    sign: b.sign.toLowerCase(),
    radius: b.radius,
    color: b.color,
    texture: b.textureUrl ?? undefined,
    glow: b.glow,
    angle: b.angle ?? undefined,
    speed: b.speed ?? undefined,
    position: b.positionX != null ? [b.positionX, b.positionY, b.positionZ] : undefined,
  }
}

export function toServerBodyRequest(body) {
  return {
    name: body.name,
    kind: body.kind.toUpperCase(),
    role: body.role ?? null,
    relation: body.relation ? body.relation.toUpperCase() : null,
    sign: body.sign.toUpperCase(),
    radius: body.radius ?? null,
    color: body.color ?? null,
    textureUrl: body.texture ?? null,
    glow: body.glow ?? false,
    angle: body.angle ?? null,
    speed: body.speed ?? null,
    positionX: body.position ? body.position[0] : null,
    positionY: body.position ? body.position[1] : null,
    positionZ: body.position ? body.position[2] : null,
  }
}

export function toServerBodyPatch(patch) {
  const out = {}
  if (patch.name !== undefined) out.name = patch.name
  if (patch.role !== undefined) out.role = patch.role
  if (patch.relation !== undefined) out.relation = patch.relation.toUpperCase()
  if (patch.sign !== undefined) out.sign = patch.sign.toUpperCase()
  if (patch.radius !== undefined) out.radius = patch.radius
  if (patch.color !== undefined) out.color = patch.color
  if (patch.texture !== undefined) out.textureUrl = patch.texture
  if (patch.glow !== undefined) out.glow = patch.glow
  if (patch.angle !== undefined) out.angle = patch.angle
  if (patch.speed !== undefined) out.speed = patch.speed
  if (patch.position !== undefined) {
    out.positionX = patch.position[0]
    out.positionY = patch.position[1]
    out.positionZ = patch.position[2]
  }
  return out
}
