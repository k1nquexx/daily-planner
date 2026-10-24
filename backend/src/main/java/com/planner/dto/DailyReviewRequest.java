package com.planner.dto;

import java.time.LocalDate;

public class DailyReviewRequest {
    private LocalDate reviewDate;
    private Integer moodScore;
    private Integer energyScore;
    private String wins;
    private String reflections;

    public DailyReviewRequest() {}

    public LocalDate getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDate reviewDate) {
        this.reviewDate = reviewDate;
    }

    public Integer getMoodScore() {
        return moodScore;
    }

    public void setMoodScore(Integer moodScore) {
        this.moodScore = moodScore;
    }

    public Integer getEnergyScore() {
        return energyScore;
    }

    public void setEnergyScore(Integer energyScore) {
        this.energyScore = energyScore;
    }

    public String getWins() {
        return wins;
    }

    public void setWins(String wins) {
        this.wins = wins;
    }

    public String getReflections() {
        return reflections;
    }

    public void setReflections(String reflections) {
        this.reflections = reflections;
    }
}
