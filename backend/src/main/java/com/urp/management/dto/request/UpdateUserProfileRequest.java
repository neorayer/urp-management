package com.urp.management.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {
    
    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;
    
    private String avatar;
    
    private String locale;
    
    private String timezone;
}
