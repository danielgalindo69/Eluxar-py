package com.eluxar.modules.catalogo.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Servicio para gestionar el almacenamiento de imágenes de productos en Cloudinary.
 * Las imágenes de perfil de usuario siguen usando ImageKit.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final String PRODUCTOS_FOLDER = "eluxar/productos";

    /**
     * Sube una imagen a Cloudinary y retorna la URL segura pública.
     *
     * @param file   Archivo a subir
     * @param folder Subcarpeta dentro de "eluxar/productos" (ej: el ID del producto)
     * @return URL pública de la imagen en Cloudinary
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        String fullFolder = PRODUCTOS_FOLDER + "/" + folder;

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", fullFolder,
                        "resource_type", "image",
                        "quality", "auto:good",
                        "fetch_format", "auto"
                )
        );

        String url = (String) uploadResult.get("secure_url");
        log.info("Imagen subida a Cloudinary: {}", url);
        return url;
    }

    /**
     * Elimina una imagen de Cloudinary usando su public_id.
     *
     * @param publicId El public_id de Cloudinary (ej: "eluxar/productos/123/abc123")
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Imagen eliminada de Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.warn("No se pudo eliminar la imagen de Cloudinary: {}", publicId, e);
        }
    }

    /**
     * Extrae el public_id de una URL de Cloudinary.
     * Ej: "https://res.cloudinary.com/du2r418gl/image/upload/v123/eluxar/productos/1/abc.jpg"
     * → "eluxar/productos/1/abc"
     */
    public String extractPublicId(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary.com")) {
            return null;
        }
        // Extraer todo después de "/upload/vXXXXXX/"
        int uploadIndex = cloudinaryUrl.indexOf("/upload/");
        if (uploadIndex == -1) return null;

        String afterUpload = cloudinaryUrl.substring(uploadIndex + "/upload/".length());
        // Remover el prefijo de versión "v123456/"
        if (afterUpload.matches("^v\\d+/.*")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
        }
        // Remover la extensión del archivo
        int dotIndex = afterUpload.lastIndexOf('.');
        return dotIndex != -1 ? afterUpload.substring(0, dotIndex) : afterUpload;
    }
}
