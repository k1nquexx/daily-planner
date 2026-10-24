package com.planner.repository;

import com.planner.model.DailyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyReviewRepository extends JpaRepository<DailyReview, Long> {
    Optional<DailyReview> findByReviewDate(LocalDate reviewDate);

    List<DailyReview> findTop30ByOrderByReviewDateDesc();

    List<DailyReview> findByReviewDateBetweenOrderByReviewDateAsc(LocalDate start, LocalDate end);
}
