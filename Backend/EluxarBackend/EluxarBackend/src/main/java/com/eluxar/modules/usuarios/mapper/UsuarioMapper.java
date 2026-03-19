package com.eluxar.modules.usuarios.mapper;

import com.eluxar.modules.usuarios.dto.UsuarioDTO;
import com.eluxar.modules.usuarios.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "rol", expression = "java(usuario.getRol().getNombre())")
    UsuarioDTO toDTO(Usuario usuario);
}
