package com.eluxar.modules.ia.dto;

import java.util.List;

public class FragranceTestResponse {
    private String response;
    private String question;
    private List<String> options;
    private List<Object> history;
    private int step;
    private boolean finished;
    private int totalSteps;

    public FragranceTestResponse() {}

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public List<Object> getHistory() { return history; }
    public void setHistory(List<Object> history) { this.history = history; }

    public int getStep() { return step; }
    public void setStep(int step) { this.step = step; }

    public boolean isFinished() { return finished; }
    public void setFinished(boolean finished) { this.finished = finished; }

    public int getTotalSteps() { return totalSteps; }
    public void setTotalSteps(int totalSteps) { this.totalSteps = totalSteps; }
}
