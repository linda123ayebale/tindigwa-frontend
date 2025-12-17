package org.example.Services;

import org.example.DTOs.DashboardStatistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private StatisticsService statisticsService;

    /**
     * Broadcast dashboard update to all connected clients
     */
    public void broadcastDashboardUpdate() {
        try {
            DashboardStatistics stats = statisticsService.getDashboardStatistics();
            
            Map<String, Object> message = new HashMap<>();
            message.put("type", "DASHBOARD_UPDATE");
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("data", stats);
            
            messagingTemplate.convertAndSend("/topic/dashboard", message);
            System.out.println("Dashboard update broadcasted at " + LocalDateTime.now());
            
        } catch (Exception e) {
            System.err.println("Error broadcasting dashboard update: " + e.getMessage());
        }
    }

    /**
     * Broadcast a specific metric update
     */
    public void broadcastMetricUpdate(String metricName, Object value) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "METRIC_UPDATE");
            message.put("metric", metricName);
            message.put("value", value);
            message.put("timestamp", LocalDateTime.now().toString());
            
            messagingTemplate.convertAndSend("/topic/dashboard/metrics", message);
            
        } catch (Exception e) {
            System.err.println("Error broadcasting metric update: " + e.getMessage());
        }
    }

    /**
     * Notify clients that cache has been invalidated
     */
    public void notifyCacheInvalidation() {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "CACHE_INVALIDATED");
            message.put("timestamp", LocalDateTime.now().toString());
            message.put("message", "Dashboard data has been updated. Refresh recommended.");
            
            messagingTemplate.convertAndSend("/topic/dashboard/events", message);
            
        } catch (Exception e) {
            System.err.println("Error notifying cache invalidation: " + e.getMessage());
        }
    }
}
