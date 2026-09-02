package com.gurujadhav.com.gurujadhav.atomurl.service;

import com.gurujadhav.com.gurujadhav.atomurl.dto.DailyStatsDto;
import com.gurujadhav.com.gurujadhav.atomurl.model.Analytical;
import com.gurujadhav.com.gurujadhav.atomurl.model.AnalyticalId;
import com.gurujadhav.com.gurujadhav.atomurl.repository.AnalyticalRepository;
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


    public List<DailyStatsDto> getStatsForUlr(String shortCode, LocalDate startDate){

        long id = Base62.decode(shortCode);
        List<Analytical> analytics = analyticalRepo.findByUrlIdAndAccessDateGreaterThanEqualOrderByAccessDateDesc(id, startDate);

        return analytics.stream()
                .map(stat -> new DailyStatsDto(stat.getAccessDate(), stat.getAccessCount()))
                .toList();
    }

    public Optional<DailyStatsDto> getStatsForDate(String shotCode, LocalDate date){
        long id = Base62.decode(shotCode);
        Optional<Analytical> response = analyticalRepo.findById(new AnalyticalId(id, date));

        if(response.isPresent()){
            return Optional.of(new DailyStatsDto(response.get().getAccessDate(), response.get().getAccessCount()));
        }

        return Optional.empty();
    }
}
