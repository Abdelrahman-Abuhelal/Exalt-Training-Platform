package exalt.training.management.dto;

import exalt.training.management.model.AppUserRole;
import lombok.*;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppUserDto {


    private Long userId;

    private String userEmail;

    private String userFirstName;

    private String userLastName;

    private String userUsername;

    private AppUserRole userRole;



}