import os
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary credentials from environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_pdf(file_bytes: bytes, user_id: str, file_uuid: str) -> dict:
    """
    Uploads PDF to Cloudinary as resource_type='raw', authenticated storage.
    Public ID format: contracts/{user_id}/{file_uuid}.pdf
    """
    public_id = f"contracts/{user_id}/{file_uuid}.pdf"
    
    try:
        response = cloudinary.uploader.upload(
            file_bytes,
            public_id=public_id,
            resource_type="raw",
            type="authenticated",
            overwrite=True
        )
        return {
            "public_id": response.get("public_id"),
            "url": response.get("secure_url"),
            "bytes": response.get("bytes")
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise Exception(f"Failed to upload contract to Cloudinary: {str(e)}")

def generate_presigned_url(public_id: str, expiry_seconds: int = 900) -> str:
    """
    Generates a short-lived signed download URL for private authenticated PDF download.
    """
    try:
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type="raw",
            type="authenticated",
            sign_url=True,
            expires_at=int(cloudinary.utils.now()) + expiry_seconds
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate Cloudinary presigned URL: {str(e)}")
        raise Exception(f"Failed to generate download URL: {str(e)}")
