package com.planner.service;

import com.planner.dto.DailyReviewRequest;
import com.planner.dto.DailySummaryDto;
import com.planner.model.DailyReview;
import com.planner.repository.DailyReviewRepository;
import com.planner.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class DailyReviewService {

    private final DailyReviewRepository reviewRepository;
    private final TaskRepository taskRepository;
    private final SyncPublisher syncPublisher;

    public DailyReviewService(DailyReviewRepository reviewRepository,
                              TaskRepository taskRepository,
                              SyncPublisher syncPublisher) {
        this.reviewRepository = reviewRepository;
        this.taskRepository = taskRepository;
        this.syncPublisher = syncPublisher;
    }

    public Optional<DailyReview> getReview(LocalDate date) {
        return reviewRepository.findByReviewDate(date);
    }

    public DailyReview saveReview(DailyReviewRequest request) {
        LocalDate date = request.getReviewDate() != null ? request.getReviewDate() : LocalDate.now();

        DailyReview review = reviewRepository.findByReviewDate(date)
                .orElse(new DailyReview(date));

        if (request.getMoodScore() != null) {
            review.setMoodScore(request.getMoodScore());
        }
        if (request.getEnergyScore() != null) {
            review.setEnergyScore(request.getEnergyScore());
        }
        review.setWins(request.getWins());
        review.setReflections(request.getReflections());
        review.setUpdatedAt(LocalDateTime.now());

        DailyReview saved = reviewRepository.save(review);
        syncPublisher.publishSyncEvent("REVIEW_UPDATED", saved);
        return saved;
    }

    public DailySummaryDto getDailySummary(LocalDate date) {
        long total = taskRepository.countByTargetDate(date);
        long completed = taskRepository.countByTargetDateAndCompletedTrue(date);

        int percent = total > 0 ? (int) Math.round(((double) completed / total) * 100) : 0;
        int streak = calculateStreak(date);

        DailySummaryDto summary = new DailySummaryDto();
        summary.setDate(date);
        summary.setTotalTasks(total);
        summary.setCompletedTasks(completed);
        summary.setCompletionPercentage(percent);
        summary.setCurrentStreakDays(streak);

        reviewRepository.findByReviewDate(date).ifPresent(r -> {
            summary.setMoodScore(r.getMoodScore());
            summary.setEnergyScore(r.getEnergyScore());
            summary.setHasReview(true);
        });

        return summary;
    }

    private int calculateStreak(LocalDate referenceDate) {
        List<LocalDate> activeDates = taskRepository.findDistinctDatesWithCompletedTasks();
        Set<LocalDate> dateSet = new HashSet<>(activeDates);

        // Also add days with reviews
        List<DailyReview> reviews = reviewRepository.findAll();
        for (DailyReview r : reviews) {
            if (r.getWins() != null && !r.getWins().trim().isEmpty() ||
                r.getReflections() != null && !r.getReflections().trim().isEmpty()) {
                dateSet.add(r.getReviewDate());
            }
        }

        int streak = 0;
        LocalDate current = referenceDate;

        // If today has no completed tasks yet, check from yesterday so streak doesn't immediately reset
        if (!dateSet.contains(current)) {
            current = current.minusDays(1);
        }

        while (dateSet.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }
}
