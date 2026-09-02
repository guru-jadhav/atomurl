package com.gurujadhav.com.gurujadhav.atomurl.service;

import com.gurujadhav.cacheclient.CacheClient;
import com.gurujadhav.com.gurujadhav.atomurl.dto.UrlResponse;
import com.gurujadhav.com.gurujadhav.atomurl.model.Analytical;
import com.gurujadhav.com.gurujadhav.atomurl.model.Url;
import com.gurujadhav.com.gurujadhav.atomurl.repository.AnalyticalRepository;
import com.gurujadhav.com.gurujadhav.atomurl.repository.UrlRepository;
import com.gurujadhav.com.gurujadhav.atomurl.utils.Base62;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
public class UrlService {
    
    @Autowired
    AnalyticalRepository analyticalRepository;

    @Autowired
    UrlRepository urlRepo;

    @Autowired
    CacheClient cache;

    private void putToCache(String shortCode, String longurl){
        try {
            cache.SET(0, shortCode, longurl);
        } catch (Exception e) {
            String msg = e.getMessage();
            log.info(msg);
        }

    }

    private Optional<Url> fetchFromDB(String shortCode){
        long id = Base62.decode(shortCode);
        return urlRepo.findById(id);
    }

    private void recordRedirect(String shortCode){
        long urlId = Base62.decode(shortCode);
        LocalDate accessDate = LocalDate.now();

        // query to update analytical tables
        analyticalRepository.incrementClickCount(urlId, accessDate);
    }

    public String resolveShortCode(String shortCode){

        Optional<String> cacheUrl = Optional.empty();

        try {
            cacheUrl = cache.GET(0, shortCode, String.class);
        } catch (Exception e) {
            log.error("Cache check failed, falling back to DB : {} ", e.getMessage());
        }

        if(cacheUrl.isPresent()){
            recordRedirect(shortCode);
            return cacheUrl.get();
        }

        Optional<Url> dbUrl = fetchFromDB(shortCode);
        if(dbUrl.isPresent()){
            String longUrl = dbUrl.get().getLongUrl();
            putToCache(shortCode, longUrl);
            recordRedirect(shortCode);
            return longUrl;
        }
        return "";
    }

    public UrlResponse createNewShortUrl(Url url) {
        try {
            Url saved = urlRepo.save(url);
            String shortCode = Base62.encode(saved.getId());
            String longurl = saved.getLongUrl();
            putToCache(shortCode, longurl);
            return new UrlResponse(shortCode, longurl, saved.getCreatedDate());
        } catch (Exception e) {
            String msg = e.getMessage();
            log.info(msg);
            return null;
        }
    }
}
