package org.example.Config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {
    
    public static final String CATEGORIES_CACHE = "categories";
    public static final String ACTIVE_CATEGORIES_CACHE = "activeCategories";
    public static final String CATEGORY_NAMES_CACHE = "categoryNames";
    public static final String DASHBOARD_STATS_CACHE = "dashboardStats";
    public static final String DASHBOARD_SUMMARY_CACHE = "dashboardSummary";
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            CATEGORIES_CACHE,
            ACTIVE_CATEGORIES_CACHE,
            CATEGORY_NAMES_CACHE,
            DASHBOARD_STATS_CACHE,
            DASHBOARD_SUMMARY_CACHE
        );
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }
    
    Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.SECONDS)
                .maximumSize(100)
                .recordStats();
    }
}
