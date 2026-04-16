package com.eluxar.modules.usuarios.service;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageKitService {

    private final ImageKit imageKit;

    public Result uploadImage(byte[] fileBytes, String fileName, String folder) throws Exception {
        log.info("Uploading image to ImageKit: {} in folder {}", fileName, folder);
        FileCreateRequest request = new FileCreateRequest(fileBytes, fileName);
        request.setFolder(folder);
        request.setUseUniqueFileName(true);
        
        Result result = imageKit.upload(request);
        log.debug("ImageKit upload successful. FileId: {}", result.getFileId());
        return result;
    }

    public void deleteImage(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return;
        }
        try {
            log.info("Deleting image from ImageKit. FileId: {}", fileId);
            imageKit.deleteFile(fileId);
            log.debug("Image deleted successfully: {}", fileId);
        } catch (Exception e) {
            log.error("Error deleting image from ImageKit (fileId: {}): {}", fileId, e.getMessage());
            // Graceful error: we don't want to fail the whole process if deletion fails
        }
    }
}
