export function imageUrl(id, size) {
  const imageId = String(id).padStart(4, "0");
  return `https://storage.googleapis.com/wchargin-climbing-public/${size}/${imageId}.jpg`;
}
