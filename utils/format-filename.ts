export default function formatFileName(fileName: string): string {
  const maxSubstrLength = 18;
  const minExtensionLength = 1;
  const minNameLength = 3;
  const ellipsis = '...';

  fileName = fileName.trim();

  if (fileName.length <= maxSubstrLength) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  let nameWithoutExtension: string, extension: string;

  if (lastDotIndex === -1 || lastDotIndex === 0 || lastDotIndex === fileName.length - 1) {
    // No extension, or filename starts/ends with a dot
    nameWithoutExtension = fileName;
    extension = '';
  } else {
    nameWithoutExtension = fileName.slice(0, lastDotIndex);
    extension = fileName.slice(lastDotIndex + 1);
  }

  if (extension.length > maxSubstrLength - minNameLength - ellipsis.length - 1) {
    // Extension is too long, truncate it
    extension = extension.slice(0, maxSubstrLength - minNameLength - ellipsis.length - 1) + '…';
  }

  const availableLength = maxSubstrLength - extension.length - ellipsis.length - (extension ? 1 : 0);
  
  if (availableLength < minNameLength) {
    // Not enough space for the name, return truncated name with ellipsis
    return nameWithoutExtension.slice(0, maxSubstrLength - ellipsis.length) + ellipsis;
  }

  const startLength = Math.ceil(availableLength / 2);
  const endLength = availableLength - startLength;

  const formattedName = 
    nameWithoutExtension.slice(0, startLength) + 
    ellipsis + 
    nameWithoutExtension.slice(-endLength);

  return extension ? `${formattedName}.${extension}` : formattedName;
}