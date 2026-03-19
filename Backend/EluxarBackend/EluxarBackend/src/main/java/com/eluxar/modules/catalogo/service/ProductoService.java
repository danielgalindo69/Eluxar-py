package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.dto.ProductoFiltroRequest;
import com.eluxar.modules.catalogo.entity.*;
import com.eluxar.modules.catalogo.mapper.ProductoMapper;
import com.eluxar.modules.catalogo.repository.CategoriaRepository;
import com.eluxar.modules.catalogo.repository.FamiliaOlfativaRepository; // [NEW]
import com.eluxar.modules.catalogo.repository.MarcaRepository;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final FamiliaOlfativaRepository familiaOlfativaRepository; // [NEW]
    private final ProductoMapper productoMapper;

    public List<ProductoDTO> listarConFiltros(ProductoFiltroRequest filtro) {
        Specification<Producto> spec = buildSpecification(filtro);
        return productoRepository.findAll(spec).stream()
                .map(productoMapper::toDTO)
                .toList();
    }

    public ProductoDTO obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .map(productoMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = mapDtoToProducto(new Producto(), dto);
        return productoMapper.toDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        
        // Limpiar para actualizar
        producto.getVariantes().clear();
        producto.getImagenes().clear();
        
        mapDtoToProducto(producto, dto);
        return productoMapper.toDTO(productoRepository.save(producto));
    }

    private Producto mapDtoToProducto(Producto producto, ProductoDTO dto) {
        Categoria categoria = dto.getCategoria() != null
                ? categoriaRepository.findByNombre(dto.getCategoria())
                    .orElseGet(() -> categoriaRepository.save(Categoria.builder().nombre(dto.getCategoria()).activa(true).build())) 
                : null;
        
        Marca marca = dto.getMarca() != null
                ? marcaRepository.findByNombre(dto.getMarca())
                    .orElseGet(() -> marcaRepository.save(Marca.builder().nombre(dto.getMarca()).activa(true).build())) 
                : null;
        
        FamiliaOlfativa familia = dto.getFamiliaOlfativa() != null
                ? familiaOlfativaRepository.findByNombre(dto.getFamiliaOlfativa())
                    .orElseGet(() -> familiaOlfativaRepository.save(FamiliaOlfativa.builder().nombre(dto.getFamiliaOlfativa()).build()))
                : null;

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setActivo(dto.isActivo());
        producto.setDestacado(dto.isDestacado());
        producto.setCategoria(categoria);
        producto.setMarca(marca);
        producto.setFamiliaOlfativa(familia);

        // Mapear variantes
        if (dto.getVariantes() != null) {
            dto.getVariantes().forEach(vDto -> {
                ProductoVariante variante = ProductoVariante.builder()
                        .producto(producto)
                        .tamanoMl(vDto.getTamanoMl())
                        .sku(vDto.getSku() != null ? vDto.getSku() : "SKU-" + System.currentTimeMillis() + "-" + vDto.getTamanoMl())
                        .activa(true)
                        .build();
                
                ProductoPrecio precio = ProductoPrecio.builder()
                        .variante(variante)
                        .precioCosto(java.math.BigDecimal.ZERO)
                        .precioVenta(vDto.getPrecioVenta())
                        .precioOferta(vDto.getPrecioOferta())
                        .activo(true)
                        .build();
                
                variante.getPrecios().add(precio);
                producto.getVariantes().add(variante);
            });
        }

        // Mapear imágenes
        if (dto.getImagenes() != null) {
            for (int i = 0; i < dto.getImagenes().size(); i++) {
                ProductoImagen imagen = ProductoImagen.builder()
                        .producto(producto)
                        .url(dto.getImagenes().get(i))
                        .principal(i == 0)
                        .orden(i)
                        .build();
                producto.getImagenes().add(imagen);
            }
        }

        return producto;
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private Specification<Producto> buildSpecification(ProductoFiltroRequest filtro) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            // Por defecto solo activos
            boolean soloActivos = filtro.getSoloActivos() == null || filtro.getSoloActivos();
            if (soloActivos) {
                predicates.add(cb.isTrue(root.get("activo")));
            }

            if (filtro.getNombre() != null && !filtro.getNombre().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")),
                        "%" + filtro.getNombre().toLowerCase() + "%"));
            }

            if (filtro.getCategoriaId() != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), filtro.getCategoriaId()));
            }

            if (filtro.getMarcaId() != null) {
                predicates.add(cb.equal(root.get("marca").get("id"), filtro.getMarcaId()));
            }

            if (filtro.getSoloDestacados() != null && filtro.getSoloDestacados()) {
                predicates.add(cb.isTrue(root.get("destacado")));
            }

            if (filtro.getPrecioMin() != null || filtro.getPrecioMax() != null) {
                Join<Producto, ProductoVariante> variantes = root.join("variantes", JoinType.LEFT);
                Join<ProductoVariante, ProductoPrecio> precios = variantes.join("precios", JoinType.LEFT);
                predicates.add(cb.isTrue(precios.get("activo")));

                if (filtro.getPrecioMin() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(precios.get("precioVenta"), filtro.getPrecioMin()));
                }
                if (filtro.getPrecioMax() != null) {
                    predicates.add(cb.lessThanOrEqualTo(precios.get("precioVenta"), filtro.getPrecioMax()));
                }
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
