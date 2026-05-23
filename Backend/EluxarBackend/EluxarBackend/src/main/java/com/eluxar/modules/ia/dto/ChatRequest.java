package com.eluxar.modules.ia.dto;

public class ChatRequest {
    private String message;
    private java.util.List<Object> history;

    public ChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public java.util.List<Object> getHistory() { return history; }
    public void setHistory(java.util.List<Object> history) { this.history = history; }
}
