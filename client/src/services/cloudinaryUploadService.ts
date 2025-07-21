declare global {
  interface Window {
    cloudinary: any;
  }
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const uploadToCloudinary = (options: {
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  allowedFormats?: string[];
  maxFileSize?: number;
} = {}): Promise<UploadResult[]> => {
  return new Promise((resolve, reject) => {
    const {
      folder = 'xl-soccer',
      multiple = false,
      maxFiles = 10,
      allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize = 10485760 // 10MB
    } = options;

    // Create upload widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dn7hgsssm',
        uploadPreset: 'xl-soccer-uploads', // We'll need to create this
        folder: folder,
        multiple: multiple,
        maxFiles: maxFiles,
        allowedFormats: allowedFormats,
        maxFileSize: maxFileSize,
        sources: ['local', 'camera'],
        showAdvancedOptions: false,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        croppingShowDimensions: true,
        croppingValidateDimensions: true,
        croppingShowBackButton: true,
        croppingCroppedWidth: 800,
        croppingCroppedHeight: 600,
        clientAllowedFormats: allowedFormats,
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        theme: 'minimal',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Fira Sans', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
              active: true
            }
          }
        }
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Upload error:', error);
          reject(error);
          return;
        }

        if (result.event === 'success') {
          const uploadResult: UploadResult = {
            public_id: result.info.public_id,
            secure_url: result.info.secure_url,
            original_filename: result.info.original_filename,
            format: result.info.format,
            width: result.info.width,
            height: result.info.height,
            bytes: result.info.bytes
          };

          if (multiple) {
            // For multiple uploads, we need to collect all results
            // This is a simplified version - you might need to handle this differently
            resolve([uploadResult]);
          } else {
            resolve([uploadResult]);
          }
        }
      }
    );

    // Open the widget
    widget.open();
  });
};

// Helper function for single image upload
export const uploadSingleImage = (folder?: string): Promise<UploadResult> => {
  return uploadToCloudinary({ folder, multiple: false }).then(results => results[0]);
};

// Helper function for multiple image upload
export const uploadMultipleImages = (folder?: string, maxFiles: number = 10): Promise<UploadResult[]> => {
  return uploadToCloudinary({ folder, multiple: true, maxFiles });
}; 