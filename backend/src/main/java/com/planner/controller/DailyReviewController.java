package com.planner.controller;

import com.planner.dto.DailyReviewRequest;
import com.planner.dto.DailySummaryDto;
import com.planner.model.DailyReview;
import com.planner.service.DailyReviewService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reviews")
public class DailyReviewController {

    private final DailyReviewService reviewService;

    public DailyReviewController(DailyReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{date}")
    public ResponseEntity<?> getReview(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reviewService.getReview(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<DailyReview> saveReview(@RequestBody DailyReviewRequest request) {
        return ResponseEntity.ok(reviewService.saveReview(request));
    }

    @GetMapping("/{date}/summary")
    public ResponseEntity<DailySummaryDto> getSummary(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reviewService.getDailySummary(date));
    }
}
