package app.tasty_flavors.usuario.repository;

import app.tasty_flavors.api.v1.usuario.model.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioModel, Integer> {

    Optional<UsuarioModel> findByEmail(String email);

    Boolean existsByEmail(String email);
}
