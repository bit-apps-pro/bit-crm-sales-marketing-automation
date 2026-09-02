interface HideableField {
  group_fields?: Record<string, HideableField>
  hidden?: boolean
}

export const filterHiddenFields = <T extends HideableField>(fields?: T[] | undefined): T[] => {
  const visibleFields: T[] = []

  for (const field of fields || []) {
    if (field.hidden) {
      continue
    }

    if (!field.group_fields || !Object.keys(field.group_fields).length) {
      visibleFields.push(field)
      continue
    }

    const visibleGroupFields = Object.fromEntries(
      Object.entries(field.group_fields).filter(([, groupField]) => !groupField.hidden)
    )

    if (Object.keys(visibleGroupFields).length) {
      visibleFields.push({ ...field, group_fields: visibleGroupFields })
    }
  }

  return visibleFields
}
