package app.tasty_flavors.api.v1.usuario.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CadastroRequest {
    private String email;
    private String senha;
}
