import { Cloudinary } from '@cloudinary/url-gen';
import { auto, fill } from '@cloudinary/url-gen/actions/resize';

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET
  }
});

const generateSHA1 = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = "ml_default"; // use the default unsigned upload preset
    
    // Generate signature
    const params = {
      timestamp: timestamp.toString(),
      upload_preset: uploadPreset,
      use_filename: 'true',
      unique_filename: 'true',
      overwrite: 'true'
    };
    
    // Create signature string by sorting parameters alphabetically
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&') + import.meta.env.VITE_CLOUDINARY_API_SECRET;
    const signature = await generateSHA1(signatureString);
    
    // Ensure all required parameters are present
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!apiKey) throw new Error('Missing Cloudinary API key');
    if (!cloudName) throw new Error('Missing Cloudinary cloud name');

    // Create and validate FormData
    const formData = new FormData();
    if (!file) throw new Error('No file to append to FormData');
    
    // Add file and all parameters to formData
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    formData.append('cloud_name', cloudName);
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Log FormData entries for debugging
    

   
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    let responseData;
    try {
      responseData = await response.json();
    } catch (err) {
      console.error('Failed to parse response:', await response.text());
      throw new Error('Failed to parse upload response');
    }

    if (!response.ok) {
      console.error('Upload failed with response:', responseData);
      throw new Error(`Failed to upload image: ${responseData.error?.message || JSON.stringify(responseData)}`);
    }

    if (!responseData.secure_url) {
      console.error('Missing secure_url in response:', responseData);
      throw new Error('Invalid upload response: missing secure_url');
    }

    // Create a Cloudinary image with optimizations
    const optimizedImage = cloudinary
      .image(responseData.public_id)
      .format('auto')
      .quality('auto')
      .resize(auto())
      .resize(fill().width(800).height(600));

    return optimizedImage.toURL();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error; // Re-throw the error to preserve the error message
  }
};
