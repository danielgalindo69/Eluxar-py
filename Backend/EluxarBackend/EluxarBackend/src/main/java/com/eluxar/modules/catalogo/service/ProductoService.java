package com.eluxar.modules.catalogo.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.dto.ProductoDTO;
import com.eluxar.modules.catalogo.dto.ProductoFiltroRequest;
import com.eluxar.modules.catalogo.entity.*;
import com.eluxar.modules.catalogo.mapper.ProductoMapper;
import com.eluxar.modules.catalogo.repository.FamiliaOlfativaRepository;
import com.eluxar.modules.catalogo.repository.MarcaRepository;
import com.eluxar.modules.catalogo.repository.ProductoRepository;
import com.eluxar.modules.inventario.service.InventarioService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MarcaRepository marcaRepository;
    private final FamiliaOlfativaRepository familiaOlfativaRepository;
    private final ProductoMapper productoMapper;
    private final CloudinaryService cloudinaryService;
    private final InventarioService inventarioService;

    public List<ProductoDTO> listarConFiltros(ProductoFiltroRequest filtro) {
        Specification<Producto> spec = buildSpecification(filtro);
        return productoRepository.findAll(spec).stream()
                .map(productoMapper::toDTO)
                .map(this::populateStock)
                .toList();
    }

    public ProductoDTO obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .map(productoMapper::toDTO)
                .map(this::populateStock)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = new Producto();
        updateProductoFields(producto, dto);
        reconcileVariantes(producto, dto.getVariantes());
        reconcileImagenes(producto, dto.getImagenes());
        
        Producto saved = productoRepository.saveAndFlush(producto);
        
        // Inicializar stock en inventario
        ensureInventario(saved, dto.getVariantes());
        
        return populateStock(productoMapper.toDTO(saved));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        updateProductoFields(producto, dto);
        reconcileVariantes(producto, dto.getVariantes());
        reconcileImagenes(producto, dto.getImagenes());

        Producto saved = productoRepository.saveAndFlush(producto);
        
        // Asegurar inventario
        ensureInventario(saved, dto.getVariantes());

        return populateStock(productoMapper.toDTO(saved));
    }

    /**
     * Agrega hasta 3 imágenes a un producto existente, subiéndolas a Cloudinary.
     *
     * @param id     ID del producto
     * @param files  Archivos de imagen (máximo 3 en total contando las existentes)
     * @return DTO actualizado con las nuevas URLs
     */
    @Transactional
    public ProductoDTO agregarImagenes(Long id, List<MultipartFile> files) throws IOException {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        int imagenesActuales = producto.getImagenes().size();
        int imagenesNuevas = files.size();

        if (imagenesActuales + imagenesNuevas > 3) {
            throw new IllegalArgumentException(
                    "Un producto puede tener máximo 3 imágenes. Actualmente tiene " +
                    imagenesActuales + " y estás intentando agregar " + imagenesNuevas + "."
            );
        }

        int ordenActual = imagenesActuales;
        for (MultipartFile file : files) {
            String url = cloudinaryService.uploadImage(file, String.valueOf(id));
            ProductoImagen imagen = ProductoImagen.builder()
                    .producto(producto)
                    .url(url)
                    .principal(ordenActual == 0)
                    .orden(ordenActual)
                    .altText(producto.getNombre())
                    .build();
            producto.getImagenes().add(imagen);
            ordenActual++;
        }

        return productoMapper.toDTO(productoRepository.save(producto));
    }

    /**
     * Elimina una imagen específica de un producto (también la elimina de Cloudinary).
     */
    @Transactional
    public ProductoDTO eliminarImagen(Long productoId, Long imagenId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

        ProductoImagen imagen = producto.getImagenes().stream()
                .filter(i -> i.getId().equals(imagenId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Imagen", imagenId));

        // Eliminar de Cloudinary
        String publicId = cloudinaryService.extractPublicId(imagen.getUrl());
        if (publicId != null) {
            cloudinaryService.deleteImage(publicId);
        }

        producto.getImagenes().remove(imagen);

        // Reajustar la imagen principal si se eliminó la primera
        if (!producto.getImagenes().isEmpty()) {
            for (int i = 0; i < producto.getImagenes().size(); i++) {
                producto.getImagenes().get(i).setOrden(i);
                producto.getImagenes().get(i).setPrincipal(i == 0);
            }
        }

        return productoMapper.toDTO(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private ProductoDTO populateStock(ProductoDTO dto) {
        if (dto.getVariantes() != null) {
            for (var v : dto.getVariantes()) {
                v.setStockActual(inventarioService.buscarPorVariante(v.getId())
                        .map(com.eluxar.modules.inventario.dto.InventarioDTO::getStockActual)
                        .orElse(0));
            }
        }
        return dto;
    }

    private void ensureInventario(Producto producto, List<ProductoDTO.VarianteDTO> variantesDto) {
        if (variantesDto == null) return;
        
        for (int i = 0; i < variantesDto.size(); i++) {
            var vDto = variantesDto.get(i);
            if (vDto.getStockActual() != null) {
                final int index = i;
                // Intentar encontrar la variante por ID, por SKU o por posición si es nueva
                producto.getVariantes().stream()
                        .filter(v -> (vDto.getId() != null && vDto.getId().equals(v.getId())) || 
                                     (vDto.getSku() != null && vDto.getSku().equals(v.getSku())) ||
                                     (vDto.getId() == null && v.getId() != null && v.getSku().startsWith("SKU-")))
                        .findFirst()
                        .ifPresent(v -> {
                            // Si hay varias nuevas, este matching por SKU- es débil, 
                            // pero para el caso de una sola variante funciona.
                            inventarioService.actualizar(v.getId(), vDto.getStockActual(), 5, "Actualización de producto");
                        });
            }
        }
    }

    private void updateProductoFields(Producto producto, ProductoDTO dto) {
        Marca marca = dto.getMarca() != null && !dto.getMarca().isBlank()
                ? marcaRepository.findByNombre(dto.getMarca())
                    .orElseGet(() -> marcaRepository.save(
                        Marca.builder().nombre(dto.getMarca()).activa(true).build()))
                : null;

        FamiliaOlfativa familia = dto.getFamiliaOlfativa() != null && !dto.getFamiliaOlfativa().isBlank()
                ? familiaOlfativaRepository.findByNombre(dto.getFamiliaOlfativa())
                    .orElseGet(() -> familiaOlfativaRepository.save(
                        FamiliaOlfativa.builder().nombre(dto.getFamiliaOlfativa()).build()))
                : null;

        CategoriaEnum categoriaEnum = null;
        if (dto.getCategoria() != null && !dto.getCategoria().isBlank()) {
            try {
                categoriaEnum = CategoriaEnum.valueOf(dto.getCategoria().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                    "Categoría inválida: '" + dto.getCategoria() + "'. " +
                    "Valores válidos: CABALLERO, DAMA, NINO, NINA"
                );
            }
        }

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setActivo(dto.isActivo());
        producto.setDestacado(dto.isDestacado());
        producto.setMarca(marca);
        producto.setCategoria(categoriaEnum);
        producto.setFamiliaOlfativa(familia);
        
        if (producto.getVariantes() == null) producto.setVariantes(new java.util.ArrayList<>());
        if (producto.getImagenes() == null) producto.setImagenes(new java.util.ArrayList<>());
    }

    private void reconcileVariantes(Producto producto, List<ProductoDTO.VarianteDTO> variantesDto) {
        if (variantesDto == null) return;

        // 1. Identificar variantes a desactivar (las que no están en el DTO)
        java.util.Set<Long> idsEnDto = variantesDto.stream()
                .map(ProductoDTO.VarianteDTO::getId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        producto.getVariantes().forEach(v -> {
            if (v.getId() != null && !idsEnDto.contains(v.getId())) {
                v.setActiva(false);
            }
        });

        // 2. Actualizar existentes o agregar nuevas
        for (var vDto : variantesDto) {
            if (vDto.getId() != null) {
                ProductoVariante existente = producto.getVariantes().stream()
                        .filter(v -> v.getId().equals(vDto.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Variante", vDto.getId()));
                
                existente.setTamanoMl(vDto.getTamanoMl());
                if (vDto.getSku() != null) existente.setSku(vDto.getSku());
                existente.setActiva(true);
                updatePrecio(existente, vDto);
            } else {
                ProductoVariante nueva = ProductoVariante.builder()
                        .producto(producto)
                        .tamanoMl(vDto.getTamanoMl())
                        .sku(vDto.getSku() != null ? vDto.getSku() :
                             "SKU-" + System.currentTimeMillis() + "-" + vDto.getTamanoMl())
                        .activa(true)
                        .build();
                updatePrecio(nueva, vDto);
                producto.getVariantes().add(nueva);
            }
        }
    }

    private void updatePrecio(ProductoVariante variante, ProductoDTO.VarianteDTO vDto) {
        if (variante.getPrecios() == null) {
            variante.setPrecios(new java.util.ArrayList<>());
        }

        // Buscamos el precio activo (o el último si no hay activo)
        ProductoPrecio precio = variante.getPrecios().stream()
                .filter(ProductoPrecio::isActivo)
                .findFirst()
                .orElse(null);

        if (precio != null) {
            precio.setPrecioVenta(vDto.getPrecioVenta());
            precio.setPrecioOferta(vDto.getPrecioOferta());
        } else {
            variante.getPrecios().add(ProductoPrecio.builder()
                    .variante(variante)
                    .precioCosto(java.math.BigDecimal.ZERO)
                    .precioVenta(vDto.getPrecioVenta())
                    .precioOferta(vDto.getPrecioOferta())
                    .activo(true)
                    .build());
        }
    }

    private void reconcileImagenes(Producto producto, List<String> imagenesUrls) {
        if (imagenesUrls == null) return;
        
        // Para imágenes, como no tienen dependencias externas críticas, 
        // podemos seguir usando el enfoque de limpiar y agregar si no queremos complicar la lógica de IDs.
        // Pero lo hacemos sobre la lista existente para mantener la relación de JPA.
        producto.getImagenes().clear();
        
        for (int i = 0; i < imagenesUrls.size(); i++) {
            producto.getImagenes().add(ProductoImagen.builder()
                    .producto(producto)
                    .url(imagenesUrls.get(i))
                    .principal(i == 0)
                    .orden(i)
                    .altText(producto.getNombre())
                    .build());
        }
    }

    private Specification<Producto> buildSpecification(ProductoFiltroRequest filtro) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            boolean soloActivos = filtro.getSoloActivos() == null || filtro.getSoloActivos();
            if (soloActivos) {
                predicates.add(cb.isTrue(root.get("activo")));
            }

            if (filtro.getNombre() != null && !filtro.getNombre().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")),
                        "%" + filtro.getNombre().toLowerCase() + "%"));
            }

            if (filtro.getCategoria() != null) {
                // Filtrar por nombre del Enum usando el valor String
                predicates.add(cb.equal(root.get("categoria").as(String.class),
                        filtro.getCategoria()));
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
