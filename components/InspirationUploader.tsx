import React, { useRef } from 'react';

const MAX_IMAGES = 4;
const ACCEPTED_FORMATS = "image/png, image/jpeg, image/webp";

interface InspirationUploaderProps {
    logo: File | null;
    images: File[];
    onLogoChange: (file: File | null) => void;
    onImagesChange: (files: File[]) => void;
    disabled: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const FilePreview: React.FC<{ file: File; onRemove: () => void; }> = ({ file, onRemove }) => (
    <div className="relative group aspect-square">
        <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover rounded-md"
            onLoad={e => URL.revokeObjectURL(e.currentTarget.src)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center rounded-md">
            <button
                onClick={onRemove}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/70 text-gray-800 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
            >
                &times;
            </button>
        </div>
    </div>
);


const InspirationUploader: React.FC<InspirationUploaderProps> = ({ logo, images, onLogoChange, onImagesChange, disabled }) => {
    const logoInputRef = useRef<HTMLInputElement>(null);
    const imagesInputRef = useRef<HTMLInputElement>(null);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onLogoChange(file);
        }
        e.target.value = ''; // Reset input
    };

    const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [...images, ...files].slice(0, MAX_IMAGES);
            onImagesChange(newImages);
        }
        e.target.value = ''; // Reset input
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Add Visual Inspiration (Optional)</h3>
            <p className="text-gray-500 text-sm mb-4">Upload your logo or reference images to get more accurate results. We recommend PNG, JPG, or WEBP formats.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Uploader */}
                <div className="md:col-span-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Logo</p>
                    {logo ? (
                        <FilePreview file={logo} onRemove={() => onLogoChange(null)} />
                    ) : (
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            disabled={disabled}
                            className="group w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <UploadIcon />
                            <span className="mt-1 text-xs text-gray-500 group-hover:text-indigo-500">Click to upload</span>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept={ACCEPTED_FORMATS}
                                onChange={handleLogoSelect}
                                className="hidden"
                                disabled={disabled}
                            />
                        </button>
                    )}
                </div>

                {/* Inspiration Images Uploader */}
                <div className="md:col-span-2">
                     <p className="text-sm font-medium text-gray-700 mb-2">Inspiration Images (up to {MAX_IMAGES})</p>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((file, index) => (
                            <FilePreview key={index} file={file} onRemove={() => onImagesChange(images.filter((_, i) => i !== index))} />
                        ))}

                        {images.length < MAX_IMAGES && (
                            <button
                                onClick={() => imagesInputRef.current?.click()}
                                disabled={disabled}
                                className="group w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UploadIcon />
                                <span className="mt-1 text-xs text-gray-500 group-hover:text-indigo-500">Add image</span>
                                <input
                                    ref={imagesInputRef}
                                    type="file"
                                    multiple
                                    accept={ACCEPTED_FORMATS}
                                    onChange={handleImagesSelect}
                                    className="hidden"
                                    disabled={disabled}
                                />
                            </button>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default InspirationUploader;
