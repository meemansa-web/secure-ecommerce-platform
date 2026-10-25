package com.ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OtpResponse {

    private boolean success;
    private String message;
    private String maskedIdentifier;
    private String channel;
    private long expiresInSeconds;

    public OtpResponse() {
    }

    public OtpResponse(
            boolean success,
            String message,
            String maskedIdentifier,
            String channel,
            long expiresInSeconds
    ) {
        this.success = success;
        this.message = message;
        this.maskedIdentifier = maskedIdentifier;
        this.channel = channel;
        this.expiresInSeconds = expiresInSeconds;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMaskedIdentifier() {
        return maskedIdentifier;
    }

    public void setMaskedIdentifier(String maskedIdentifier) {
        this.maskedIdentifier = maskedIdentifier;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }
}
