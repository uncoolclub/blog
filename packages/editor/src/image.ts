export function imageFromDataTransfer(
  data: DataTransfer | null,
): File | undefined {
  return [...(data?.files ?? [])].find((f) => f.type.startsWith('image/'))
}
