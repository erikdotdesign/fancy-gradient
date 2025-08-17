export const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<String> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1); // Only downscale
      const width = img.width * ratio;
      const height = img.height * ratio;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 JPEG (you can also use "image/png")
      const base64 = canvas.toDataURL("image/png", 0.9);
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}