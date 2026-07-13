export interface EntityFieldType {
  customFields?: Record<
    string,
    {
      field_id: number
      field_key: string
    }
  >
  systemDefinedFields?: Record<string, string>
}

type TransformedData = Record<string, Record<string, string>>

type ConversionMappingType = Record<string, EntityFieldType>

export default function generateEntityConversionFieldMappings(
  data: boolean | ConversionMappingType
): false | TransformedData {
  if (!data || typeof data !== 'object') return false

  const transformedData: TransformedData = {}

  for (const entityType in data) {
    if (Object.prototype.hasOwnProperty.call(data, entityType)) {
      const entityData = data[entityType]
      const entity: Record<string, string> = {}

      if (entityData.systemDefinedFields) {
        for (const key in entityData.systemDefinedFields) {
          if (Object.prototype.hasOwnProperty.call(entityData.systemDefinedFields, key)) {
            entity[key] = entityData.systemDefinedFields[key]
          }
        }
      }

      if (entityData.customFields) {
        for (const key in entityData.customFields) {
          if (Object.prototype.hasOwnProperty.call(entityData.customFields, key)) {
            entity[key] = entityData.customFields[key].field_key
          }
        }
      }

      transformedData[entityType] = entity
    }
  }

  return transformedData
}
