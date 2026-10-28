package com.gurujadhav.com.gurujadhav.atomurl.admin;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ErrorRingBuffer errorRingBuffer;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> data = adminService.getSystemOverview();
        return ResponseEntity.ok(new ApiResponse<>(200, "success", data));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<AdminUsersResponse>> getUsers(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<AdminUserProjection> pageResult = adminService.getAdminUsers(query, page, size);
        AdminUsersResponse response = new AdminUsersResponse(
                pageResult.getContent(),
                pageResult.getTotalElements(),
                pageResult.getNumber(),
                pageResult.getTotalPages()
        );
        return ResponseEntity.ok(new ApiResponse<>(200, "success", response));
    }

    @GetMapping("/errors")
    public ResponseEntity<ApiResponse<List<ErrorRingBuffer.ErrorRecord>>> getRecentErrors() {
        List<ErrorRingBuffer.ErrorRecord> errors = errorRingBuffer.getRecentErrors();
        return ResponseEntity.ok(new ApiResponse<>(200, "success", errors));
    }

    @DeleteMapping("/errors")
    public ResponseEntity<ApiResponse<Void>> clearErrors() {
        errorRingBuffer.clear();
        return ResponseEntity.ok(new ApiResponse<>(200, "success", null));
    }
}
