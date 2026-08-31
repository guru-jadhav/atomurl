package com.gurujadhav.com.gurujadhav.atomurl.repository;

import com.gurujadhav.com.gurujadhav.atomurl.model.Analytical;
import com.gurujadhav.com.gurujadhav.atomurl.model.AnalyticalId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticalRepository extends JpaRepository<Analytical, AnalyticalId> {
}
