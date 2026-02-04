package app.tasty_flavors.api.v1.usuario.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CadastroResponse {
    private Integer id;
    private String email;
}
