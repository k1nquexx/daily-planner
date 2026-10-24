package com.planner.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class SyncPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public SyncPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishSyncEvent(String action, Object data) {
        Map<String, Object> payload = Map.of(
                "action", action,
                "data", data != null ? data : Map.of(),
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend((String) "/topic/sync", (Object) payload);
    }
}
