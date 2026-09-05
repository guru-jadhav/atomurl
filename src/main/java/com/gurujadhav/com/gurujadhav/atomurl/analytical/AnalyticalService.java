package com.gurujadhav.com.gurujadhav.atomurl.analytical;

import com.gurujadhav.com.gurujadhav.atomurl.utils.Base62;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyticalService {

    @Autowired
    AnalyticalRepository analyticalRepo;


    public List<AnalyticalResponse> getStatsForUlr(String shortCode, LocalDate startDate){

        long id = Base62.decode(shortCode);
        List<Analytical> analytics = analyticalRepo.findByUrlIdAndAccessDateGreaterThanEqualOrderByAccessDateDesc(id, startDate);

        return analytics.stream()
                .map(stat -> new AnalyticalResponse(stat.getAccessDate(), stat.getAccessCount()))
                .toList();
    }

    public Optional<AnalyticalResponse> getStatsForDate(String shotCode, LocalDate date){
        long id = Base62.decode(shotCode);
        Optional<Analytical> response = analyticalRepo.findById(new AnalyticalId(id, date));

        return response.map(analytical -> new AnalyticalResponse(analytical.getAccessDate(), analytical.getAccessCount()));

    }
}
