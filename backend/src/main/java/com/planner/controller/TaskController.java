package com.planner.controller;

import com.planner.dto.TaskRequest;
import com.planner.model.Task;
import com.planner.service.TaskService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(taskService.getTasksForDate(targetDate));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleTask(id));
    }

    @PatchMapping("/{taskId}/subtasks/{subtaskId}/toggle")
    public ResponseEntity<Task> toggleSubtask(@PathVariable Long taskId, @PathVariable Long subtaskId) {
        return ResponseEntity.ok(taskService.toggleSubtask(taskId, subtaskId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/rollover")
    public ResponseEntity<?> rollover(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Task> moved = taskService.rolloverIncompleteTasks(from, to);
        return ResponseEntity.ok(Map.of(
                "message", "Перенесено задач: " + moved.size(),
                "count", moved.size()
        ));
    }
}
