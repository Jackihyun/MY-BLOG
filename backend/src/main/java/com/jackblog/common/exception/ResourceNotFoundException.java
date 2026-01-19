package com.jackblog.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException post(String slug) {
        return new ResourceNotFoundException("Post not found: " + slug);
    }

    public static ResourceNotFoundException comment(Long id) {
        return new ResourceNotFoundException("Comment not found: " + id);
    }
}
