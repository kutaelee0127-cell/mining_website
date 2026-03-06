export interface StyleItemDto {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

let styles: StyleItemDto[] = [];

export async function listStyles(): Promise<StyleItemDto[]> {
  return styles;
}

export async function addStyle(input: Omit<StyleItemDto, "id">): Promise<StyleItemDto> {
  const item: StyleItemDto = { id: `style-ui-${styles.length + 1}`, ...input };
  styles = [...styles, item];
  return item;
}

export async function saveStyle(id: string, patch: Partial<Omit<StyleItemDto, "id">>): Promise<StyleItemDto | null> {
  const index = styles.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }
  styles[index] = { ...styles[index], ...patch };
  return styles[index];
}
