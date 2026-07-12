export const TABLE_PREFIX = "itinerary_plan_" as const;

export function tableName<Name extends string>(name: Name): `${typeof TABLE_PREFIX}${Name}` {
  return `${TABLE_PREFIX}${name}`;
}
