package com.eluxar.modules.ia.dto;

import java.util.List;

public class FragranceTestRequest {
    private String message;
    private List<Object> history;
    private int step;

    public FragranceTestRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Object> getHistory() { return history; }
    public void setHistory(List<Object> history) { this.history = history; }

    public int getStep() { return step; }
    public void setStep(int step) { this.step = step; }
}
