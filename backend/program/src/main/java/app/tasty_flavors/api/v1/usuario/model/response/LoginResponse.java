package app.tasty_flavors.api.v1.usuario.model.response;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private Integer id;
    private String email;
    private String token;
}