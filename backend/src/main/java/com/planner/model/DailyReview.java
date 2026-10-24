package com.planner.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_reviews")
public class DailyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate reviewDate;

    // Mood rating 1-5
    private Integer moodScore = 3;

    // Energy rating 1-5
    private Integer energyScore = 3;

    // Key wins of the day
    @Column(columnDefinition = "TEXT")
    private String wins;

    // Notes, reflections, thoughts
    @Column(columnDefinition = "TEXT")
    private String reflections;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public DailyReview() {}

    public DailyReview(LocalDate reviewDate) {
        this.reviewDate = reviewDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
