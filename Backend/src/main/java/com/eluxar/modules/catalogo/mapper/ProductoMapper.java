package com.eluxar.modules.catalogo.mapper;

import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.dto.ProductoDTO.VarianteDTO;
import com.eluxar.modules.catalogo.entity.Producto;
import com.eluxar.modules.catalogo.entity.ProductoVariante;
import com.eluxar.modules.catalogo.entity.ProductoImagen;
import com.eluxar.modules.catalogo.entity.ProductoPrecio;
import com.eluxar.modules.catalogo.entity.CategoriaEnum;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductoMapper {

    @Mapping(target = "marca", expression = "java(producto.getMarca() != null ? producto.getMarca().getNombre() : null)")
    @Mapping(target = "categoria", expression = "java(producto.getCategoria() != null ? producto.getCategoria().name() : null)")
    @Mapping(target = "familiaOlfativa", expression = "java(producto.getFamiliaOlfativa() != null ? producto.getFamiliaOlfativa().getNombre() : null)")
    @Mapping(target = "variantes", source = "variantes")
    @Mapping(target = "imagenes", source = "imagenes", qualifiedByName = "toImageUrls")
    ProductoDTO toDTO(Producto producto);

    @Named("toImageUrls")
    default List<String> toImageUrls(List<ProductoImagen> imagenes) {
        if (imagenes == null) return List.of();
        return imagenes.stream().map(ProductoImagen::getUrl).toList();
    }

    @Mapping(target = "precioVenta", source = "precios", qualifiedByName = "getPrecioVenta")
    @Mapping(target = "precioOferta", source = "precios", qualifiedByName = "getPrecioOferta")
    @Mapping(target = "stockActual", ignore = true)
    VarianteDTO toVarianteDTO(ProductoVariante variante);

    @Named("getPrecioVenta")
    default BigDecimal getPrecioVenta(List<ProductoPrecio> precios) {
        if (precios == null || precios.isEmpty()) return BigDecimal.ZERO;
        return precios.stream().filter(p -> p.isActivo() && p.getPrecioVenta() != null)
                .map(ProductoPrecio::getPrecioVenta)
                .findFirst().orElse(BigDecimal.ZERO);
    }

    @Named("getPrecioOferta")
    default BigDecimal getPrecioOferta(List<ProductoPrecio> precios) {
        if (precios == null || precios.isEmpty()) return null;
        return precios.stream().filter(p -> p.isActivo() && p.getPrecioOferta() != null)
                .map(ProductoPrecio::getPrecioOferta)
                .findFirst().orElse(null);
    }
}
