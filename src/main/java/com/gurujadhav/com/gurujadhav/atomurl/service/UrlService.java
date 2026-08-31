package com.gurujadhav.com.gurujadhav.atomurl.service;

import com.gurujadhav.cacheclient.CacheClient;
import com.gurujadhav.com.gurujadhav.atomurl.model.Url;
import com.gurujadhav.com.gurujadhav.atomurl.repository.UrlRepository;
import com.gurujadhav.com.gurujadhav.atomurl.utils.Base62;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UrlService {

    @Autowired
    UrlRepository urlRepo;

    @Autowired
    CacheClient cache;

    public String resolveShortCode(String shortCode){

        // before we go for DB we need to check in the cache

        try {
           Optional<String> longUrl = cache.GET(0, shortCode, String.class);

           if(longUrl.isPresent()){
               return longUrl.get();
           }

        } catch (Exception e) {
            long id = Base62.decode(shortCode);
            Optional<Url> url = urlRepo.findById(id);
            if(url.isPresent()){
                return url.get().getLongUrl();
            }
        }

        return "";
    }
}
