import type { Extension } from "@/types";
import { createImageNodeView } from "@/utils/createImageNodeView";

export interface ImageOptions {
  maxSize?: number; // Max file size in bytes (default: 10MB)
  allowedTypes?: string[]; // Allowed MIME types
  uploadHandler?: (file: File) => Promise<string>; // Custom upload handler that returns image URL
  placeholder?: string; // Placeholder image while uploading
  inline?: boolean; // Whether image is inline or block-level
  onError?: (error: ImageUploadError) => void; // Custom error handler
}

export interface ImageUploadError {
  type: "invalidType" | "fileSize" | "uploadFailed" | "readError";
  message: string;
  file?: File;
  details?: any;
}

export const ImageExtension: Extension = {
  name: "image",
  type: "node",
  priority: 200,

  addCommands() {
    return {
      insertImage:
        (src: string, alt?: string, title?: string) =>
        ({ editor, tr }) => {
          if (!src) return false;

          const imageNode = editor.state.schema.nodes.image;
          if (!imageNode) return false;

          const node = imageNode.create({
            src,
            alt: alt || "",
            title: title || "",
          });

          // Insert at current position
          tr.replaceSelectionWith(node);

          return true;
        },

      uploadImage:
        (file: File, options?: Partial<ImageOptions>) =>
        ({ editor }) => {
          const opts: ImageOptions = {
            maxSize: 10 * 1024 * 1024, // 10MB default
            allowedTypes: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
            ],
            placeholder:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+",
            inline: false,
            ...options,
          };

          // Validate file type
          if (!opts.allowedTypes!.includes(file.type)) {
            const errorMsg = `Invalid file type: ${file.type}. Allowed types: ${opts.allowedTypes!.join(", ")}`;
            const error: ImageUploadError = {
              type: "invalidType",
              message: errorMsg,
              file,
              details: { fileType: file.type, allowedTypes: opts.allowedTypes },
            };
            console.error(errorMsg);

            if (opts.onError) {
              opts.onError(error);
            } else {
              console.warn("Image upload error:", error);
            }
            return false;
          }

          // Validate file size
          if (file.size > opts.maxSize!) {
            const maxSizeMB = (opts.maxSize! / 1024 / 1024).toFixed(2);
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const errorMsg = `File too large: ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`;
            const error: ImageUploadError = {
              type: "fileSize",
              message: errorMsg,
              file,
              details: { fileSize: file.size, maxSize: opts.maxSize },
            };
            console.error(errorMsg);

            if (opts.onError) {
              opts.onError(error);
            } else {
              console.warn("Image upload error:", error);
            }
            return false;
          }

          // Insert placeholder first
          const placeholderInserted = editor.commands.insertImage(
            opts.placeholder!,
            `Uploading ${file.name}...`,
          );
          if (!placeholderInserted) return false;

          // Handle upload
          if (opts.uploadHandler) {
            // Use custom upload handler
            opts
              .uploadHandler(file)
              .then((url) => {
                // Replace placeholder with actual image
                editor.commands.updateImage(opts.placeholder!, url, file.name);
              })
              .catch((err) => {
                const errorMsg = `Upload failed: ${err.message || "Unknown error"}`;
                const error: ImageUploadError = {
                  type: "uploadFailed",
                  message: errorMsg,
                  file,
                  details: err,
                };
                console.error(errorMsg, err);

                if (opts.onError) {
                  opts.onError(error);
                } else {
                  console.warn("Image upload error:", error);
                }

                editor.commands.removeImage(opts.placeholder!);
              });
          } else {
            // Use FileReader for local preview
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              if (dataUrl) {
                editor.commands.updateImage(
                  opts.placeholder!,
                  dataUrl,
                  file.name,
                );
              }
            };
            reader.onerror = () => {
              const errorMsg = "Failed to read file. Please try again.";
              const error: ImageUploadError = {
                type: "readError",
                message: errorMsg,
                file,
              };
              console.error(errorMsg);

              if (opts.onError) {
                opts.onError(error);
              } else {
                console.warn("Image upload error:", error);
              }

              editor.commands.removeImage(opts.placeholder!);
            };
            reader.readAsDataURL(file);
          }

          return true;
        },

      updateImage:
        (oldSrc: string, newSrc?: string, alt?: string, title?: string) =>
        ({
          editor,
          tr,
          dispatch,
        }: {
          editor: any;
          tr: any;
          dispatch?: any;
        }) => {
          let updated = false;
          const actualNewSrc = newSrc || oldSrc;

          editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === "image" && node.attrs.src === oldSrc) {
              const newAttrs = {
                ...node.attrs,
                src: actualNewSrc,
                alt: alt !== undefined ? alt : node.attrs.alt,
                title: title !== undefined ? title : node.attrs.title,
              };
              tr.setNodeMarkup(pos, null, newAttrs);
              updated = true;
            }
          });

          if (updated && dispatch) {
            dispatch(tr);
          }

          return updated;
        },

      removeImage:
        (src: string) =>
        ({ editor, tr, dispatch }) => {
          let removed = false;

          editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === "image" && node.attrs.src === src) {
              tr.delete(pos, pos + node.nodeSize);
              removed = true;
            }
          });

          if (removed && dispatch) {
            dispatch(tr);
          }

          return removed;
        },

      setImageAlignment:
        (src: string, _alignment: "left" | "center" | "right") =>
        ({ commands }: { commands: any }) => {
          return commands.updateImage(src, src, undefined, undefined);
        },

      setImageSize:
        (src: string, _width?: number, _height?: number) =>
        ({ commands }: { commands: any }) => {
          return commands.updateImage(src, src, undefined, undefined);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-i": () => false, // Will be handled by editor commands
    };
  },

  addNodeView() {
    return createImageNodeView;
  },

  addOptions() {
    return {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      uploadHandler: undefined,
      placeholder:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+",
      inline: false,
    };
  },
};

// Utility functions for image handling
export function validateImageFile(
  file: File,
  options?: Partial<ImageOptions>,
): { valid: boolean; error?: string } {
  const opts = {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ...options,
  };

  if (!opts.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes.join(", ")}`,
    };
  }

  if (file.size > opts.maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(opts.maxSize / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as data URL"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}
