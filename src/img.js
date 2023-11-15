export function gcsUrl(objectName) {
  return `https://storage.googleapis.com/wchargin-climbing-public/${objectName}`;
}

export function imageUrl(id, size) {
  const imageId = String(id).padStart(4, "0");
  const objectName = `${size}/${imageId}.jpg`;
  return gcsUrl(objectName);
}
