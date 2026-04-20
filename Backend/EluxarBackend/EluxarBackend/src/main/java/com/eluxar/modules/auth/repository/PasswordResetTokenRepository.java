package com.eluxar.modules.auth.repository;

import com.eluxar.modules.auth.entity.PasswordResetToken;
import com.eluxar.modules.usuarios.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findFirstByUsuarioAndUsedFalseAndExpirationTimeAfterOrderByCreatedAtDesc(Usuario usuario, LocalDateTime now);

    void deleteByExpirationTimeBefore(LocalDateTime time);
}
