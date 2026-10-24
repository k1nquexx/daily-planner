package com.planner.repository;

import com.planner.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByTargetDateOrderBySortOrderAscIdAsc(LocalDate targetDate);

    List<Task> findByTargetDateAndCompletedFalse(LocalDate targetDate);

    long countByTargetDate(LocalDate targetDate);

    long countByTargetDateAndCompletedTrue(LocalDate targetDate);

    @Query("SELECT DISTINCT t.targetDate FROM Task t WHERE t.completed = true ORDER BY t.targetDate DESC")
    List<LocalDate> findDistinctDatesWithCompletedTasks();

    @Query("SELECT t.targetDate, COUNT(t), SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END) " +
           "FROM Task t WHERE t.targetDate BETWEEN :startDate AND :endDate GROUP BY t.targetDate")
    List<Object[]> getTaskStatsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
