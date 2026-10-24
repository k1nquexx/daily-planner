package com.planner.dto;

import com.planner.model.Priority;
import java.time.LocalDate;
import java.util.List;

public class TaskRequest {
    private String title;
    private String description;
    private Priority priority = Priority.MEDIUM;
    private String category = "GENERAL";
    private LocalDate targetDate;
    private Integer estimatedMinutes;
    private List<SubtaskRequest> subtasks;

    public TaskRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public List<SubtaskRequest> getSubtasks() {
        return subtasks;
    }

    public void setSubtasks(List<SubtaskRequest> subtasks) {
        this.subtasks = subtasks;
    }
}
