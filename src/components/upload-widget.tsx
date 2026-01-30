import { useEffect, useRef, useState } from "react";
import { UploadWidgetProps, UploadWidgetValue } from "@/types";
import { UploadCloud, X } from "lucide-react";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_DELETE_URL,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
} from "@/constants";

const UploadWidget = ({
  value = null,
  onChange,
  disabled = false,
}: UploadWidgetProps) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);

  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setPreview(value);
    if (!value) setDeleteToken(null);
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "classroom-uploads",
          maxFileSize: MAX_FILE_SIZE,
          clientAllowedFormats: ALLOWED_TYPES.map((type) => type.split("/")[1]),
          return_delete_token: true,
        },
        (error, result) => {
          if (!error && result && result.event === "success" && result.info) {
            const payload: UploadWidgetValue = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };

            setPreview(payload);
            setDeleteToken(result.info.delete_token ?? null);
            onChangeRef.current?.(payload);
          }
        },
      );

      return true;
    };
    if (initializeWidget()) return;

    const intervalId = window.setInterval(() => {
      if (initializeWidget()) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const openWidget = () => {
    if (disabled) return;
    widgetRef.current?.open();
  };

  const removeFromCloudinary = async () => {
    if (!preview) return;

    setIsRemoving(true);
    try {
      if (deleteToken) {
        const response = await fetch(CLOUDINARY_DELETE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ token: deleteToken }).toString(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to remove image");
        }
      }

      setPreview(null);
      setDeleteToken(null);
      onChangeRef.current?.(null);
    } catch (error) {
      console.error("Error removing image from Cloudinary:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="upload-preview">
          <img src={preview.url} alt="Uploaded image preview" />
          <button
            type="button"
            onClick={removeFromCloudinary}
            disabled={isRemoving || disabled}
            className=""
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={openWidget}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              openWidget();
            }
          }}
        >
          <div className="upload-prompt">
            <UploadCloud className="icon" />
            <div>
              <p>Click to upload photo</p>
              <p>PNG / JPG / WEBP up to 3MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWidget;
