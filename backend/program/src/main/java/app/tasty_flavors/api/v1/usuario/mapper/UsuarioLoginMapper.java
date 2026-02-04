package app.tasty_flavors.api.v1.usuario.mapper;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.response.LoginResponse;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class UsuarioLoginMapper {

    public static LoginResponse toResponse(UsuarioModel usuario, String token) {
        return LoginResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .token(token)
                .build();
    }
}
