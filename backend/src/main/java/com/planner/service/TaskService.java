package com.planner.service;

import com.planner.dto.SubtaskRequest;
import com.planner.dto.TaskRequest;
import com.planner.model.Priority;
import com.planner.model.Subtask;
import com.planner.model.Task;
import com.planner.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final SyncPublisher syncPublisher;

    public TaskService(TaskRepository taskRepository, SyncPublisher syncPublisher) {
        this.taskRepository = taskRepository;
        this.syncPublisher = syncPublisher;
    }

    public List<Task> getTasksForDate(LocalDate date) {
        return taskRepository.findByTargetDateOrderBySortOrderAscIdAsc(date);
    }

    public Task createTask(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        task.setCategory(request.getCategory() != null ? request.getCategory() : "GENERAL");
        task.setTargetDate(request.getTargetDate() != null ? request.getTargetDate() : LocalDate.now());
        task.setEstimatedMinutes(request.getEstimatedMinutes());

        long count = taskRepository.countByTargetDate(task.getTargetDate());
        task.setSortOrder((int) count);

        if (request.getSubtasks() != null) {
            for (SubtaskRequest sr : request.getSubtasks()) {
                if (sr.getTitle() != null && !sr.getTitle().trim().isEmpty()) {
                    task.addSubtask(new Subtask(sr.getTitle().trim(), sr.isCompleted()));
                }
            }
        }

        Task saved = taskRepository.save(task);
        syncPublisher.publishSyncEvent("TASK_CREATED", saved);
        return saved;
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Задача не найдена: " + id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getCategory() != null) {
            task.setCategory(request.getCategory());
        }
        if (request.getTargetDate() != null) {
            task.setTargetDate(request.getTargetDate());
        }
        task.setEstimatedMinutes(request.getEstimatedMinutes());

        if (request.getSubtasks() != null) {
            List<Subtask> newSubtasks = new ArrayList<>();
            for (SubtaskRequest sr : request.getSubtasks()) {
                if (sr.getTitle() != null && !sr.getTitle().trim().isEmpty()) {
                    newSubtasks.add(new Subtask(sr.getTitle().trim(), sr.isCompleted()));
                }
            }
            task.setSubtasks(newSubtasks);
        }

        Task saved = taskRepository.save(task);
        syncPublisher.publishSyncEvent("TASK_UPDATED", saved);
        return saved;
    }

    public Task toggleTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Задача не найдена: " + id));

        boolean newStatus = !task.isCompleted();
        task.setCompleted(newStatus);
        task.setCompletedAt(newStatus ? LocalDateTime.now() : null);

        // Also update subtasks to match if all are marked
        if (newStatus && task.getSubtasks() != null) {
            for (Subtask s : task.getSubtasks()) {
                s.setCompleted(true);
            }
        }

        Task saved = taskRepository.save(task);
        syncPublisher.publishSyncEvent("TASK_TOGGLED", saved);
        return saved;
    }

    public Task toggleSubtask(Long taskId, Long subtaskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Задача не найдена: " + taskId));

        for (Subtask s : task.getSubtasks()) {
            if (s.getId().equals(subtaskId)) {
                s.setCompleted(!s.isCompleted());
                break;
            }
        }

        // If all subtasks are done, auto-mark task as completed
        boolean allSubtasksDone = !task.getSubtasks().isEmpty() &&
                task.getSubtasks().stream().allMatch(Subtask::isCompleted);
        if (allSubtasksDone) {
            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
        }

        Task saved = taskRepository.save(task);
        syncPublisher.publishSyncEvent("TASK_UPDATED", saved);
        return saved;
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Задача не найдена: " + id));

        taskRepository.delete(task);
        syncPublisher.publishSyncEvent("TASK_DELETED", id);
    }

    public List<Task> rolloverIncompleteTasks(LocalDate fromDate, LocalDate toDate) {
        List<Task> incomplete = taskRepository.findByTargetDateAndCompletedFalse(fromDate);
        long toDateTaskCount = taskRepository.countByTargetDate(toDate);

        int order = (int) toDateTaskCount;
        for (Task t : incomplete) {
            t.setTargetDate(toDate);
            t.setSortOrder(order++);
            taskRepository.save(t);
        }

        syncPublisher.publishSyncEvent("ROLLOVER_COMPLETED", incomplete.size());
        return incomplete;
    }
}
