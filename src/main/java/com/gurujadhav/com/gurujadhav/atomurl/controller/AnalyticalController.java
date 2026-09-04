package com.gurujadhav.com.gurujadhav.atomurl.controller;

import com.gurujadhav.com.gurujadhav.atomurl.dto.ApiResponse;
import com.gurujadhav.com.gurujadhav.atomurl.dto.DailyStatsDto;
import com.gurujadhav.com.gurujadhav.atomurl.service.AnalyticalService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PastOrPresent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@Validated
public class AnalyticalController {

    @Autowired
    AnalyticalService analyticalService;

    @GetMapping("/api/analytical/{shortCode}")
    public ResponseEntity<ApiResponse<List<DailyStatsDto>>> getAnalyticalForUrl(
            @PathVariable String shortCode,
            @RequestParam(name = "pastdays", required = false, defaultValue = "30")
            @Min(value = 1, message = "Invalid 'pastdays' value. It must be between 1 and 30 days.")
            @Max(value = 30, message = "Invalid 'pastdays' value. It must be between 1 and 30 days.")
            int pastdays) {

        LocalDate startDate = LocalDate.now().minusDays(pastdays - 1);


        List<DailyStatsDto> cleanedStats = analyticalService.getStatsForUlr(shortCode, startDate);

        if(cleanedStats.isEmpty()){
            ApiResponse<List<DailyStatsDto>> emptyResponse = new ApiResponse<>(200,
                    "No click stats recorded yet for this URL", cleanedStats);
            return ResponseEntity.status(HttpStatus.OK).body(emptyResponse);
        }

        ApiResponse<List<DailyStatsDto>> successResponse = new ApiResponse<>(200,
                "success", cleanedStats);
        return ResponseEntity.status(HttpStatus.OK).body(successResponse);
    }

    @GetMapping("/api/analytical/{shortCode}/day")
    public ResponseEntity<ApiResponse<DailyStatsDto>> getStatsForDate(
            @PathVariable String shortCode,
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @PastOrPresent(message = "Date cannot be in the future.")
            LocalDate date)
    {
        LocalDate targetDate = date == null ? LocalDate.now() : date;

        Optional<DailyStatsDto> response = analyticalService.getStatsForDate(shortCode, targetDate);

        if(response.isEmpty()){
            ApiResponse<DailyStatsDto> errorResponse = new ApiResponse<DailyStatsDto>(200, "No click stats recorded yet for this URL", null);
            return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
        }else{
            ApiResponse<DailyStatsDto> successResponse = new ApiResponse<DailyStatsDto>(200, "success", response.get());
            return ResponseEntity.status(HttpStatus.OK).body(successResponse);
        }
    }
}
