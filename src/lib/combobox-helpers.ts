/**
 * Helpers para criar opções de combobox a partir de entidades
 */

export interface ComboboxOption {
  value: string
  label: string
}

/**
 * Interface genérica para entidades que podem ser convertidas em opções de combobox
 */
export interface ComboboxEntity {
  id: string
  name: string
}

/**
 * Helper para criar opções customizadas com diferentes campos de label
 * @param entities Lista de entidades
 * @param valueField Campo a ser usado como value
 * @param labelField Campo a ser usado como label
 * @returns Array de opções para combobox
 */
/**
 * Helper para criar opções de combobox com função de mapeamento customizada
 * @param entities Lista de entidades
 * @param mapperFn Função que mapeia uma entidade para uma opção de combobox
 * @returns Array de opções para combobox
 */
export function createComboBoxOptions<T>(
  entities: T[] | undefined,
  mapperFn: (entity: T) => ComboboxOption,
): ComboboxOption[] {
  if (!entities) return []

  return entities.map(mapperFn)
}
