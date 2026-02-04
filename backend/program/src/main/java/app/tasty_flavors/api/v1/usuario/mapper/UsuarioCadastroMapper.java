package app.tasty_flavors.api.v1.usuario.mapper;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import app.tasty_flavors.api.v1.usuario.model.response.CadastroResponse;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class UsuarioCadastroMapper {

    public static CadastroResponse toResponse(UsuarioModel usuario) {

        return CadastroResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .build();
    }
}
