package com.eluxar.modules.ia.dto;

public class ChatResponse {
    private String response;
    private java.util.List<Object> history;

    public ChatResponse() {}

    public ChatResponse(String response, java.util.List<Object> history) {
        this.response = response;
        this.history = history;
    }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public java.util.List<Object> getHistory() { return history; }
    public void setHistory(java.util.List<Object> history) { this.history = history; }
}
