package com.gurujadhav.com.gurujadhav.atomurl.config;


import com.gurujadhav.cacheclient.CacheClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class CacheConfig {

    @Value("${cachecore.domain}")
    String domain;

    @Value("${cachecore.port}")
    int port;

    private static final int MAX_RETRIES = 10;
    private static final int DELAY_MS = 3000;

    @Bean(destroyMethod = "close")
    public CacheClient getCacheClient() {
        CacheClient client = new CacheClient(domain, port);

        for(int i = 1; i <= MAX_RETRIES; i++){
            try{
                if (client.connect()){
                    String msg = ">>> Connected with CacheCore successfully on port : " + port;
                    log.info(msg);
                    return client;
                }
            } catch (Exception e) {
                String msg = ">>> Failed to connect to CacheCore (Attempt " + i + "/" + MAX_RETRIES + ") : " + e.getMessage();
                log.info(msg);

                if(i == MAX_RETRIES){
                    throw new RuntimeException("Could not connect to CacheCore after " + MAX_RETRIES + " attempts.", e);
                }

                try {
                    Thread.sleep(DELAY_MS);
                } catch (Exception ex) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ex);
                }
            }
        }

        throw new RuntimeException("Could not connect to CacheCore.");
    }


}
