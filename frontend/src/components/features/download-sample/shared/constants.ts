export const SAMPLE_FILE_NAMES = {
  SAMPLE_ENTITIES: 'sample_entities' as const,
  SAMPLE_TAGS: 'sample_tags' as const
}
export type SampleFileName = (typeof SAMPLE_FILE_NAMES)[keyof typeof SAMPLE_FILE_NAMES]
