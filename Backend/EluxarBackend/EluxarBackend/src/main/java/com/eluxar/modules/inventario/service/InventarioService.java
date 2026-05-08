package com.eluxar.modules.inventario.service;

import com.eluxar.exception.ResourceNotFoundException;
import com.eluxar.modules.catalogo.repository.ProductoVarianteRepository;
import com.eluxar.modules.inventario.dto.InventarioDTO;
import com.eluxar.modules.inventario.entity.Inventario;
import com.eluxar.modules.inventario.entity.MovimientoInventario;
import com.eluxar.modules.inventario.repository.InventarioRepository;
import com.eluxar.modules.inventario.repository.MovimientoRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final MovimientoRepository movimientoRepository;
    private final ProductoVarianteRepository varianteRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ─── Inventario ─────────────────────────────────────────────────────────────

    public List<InventarioDTO> listarTodo() {
        return inventarioRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public InventarioDTO obtenerPorVariante(Long varianteId) {
        return buscarPorVariante(varianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario para variante", varianteId));
    }

    public java.util.Optional<InventarioDTO> buscarPorVariante(Long varianteId) {
        return inventarioRepository.findByVarianteId(varianteId)
                .map(this::toDTO);
    }

    @Transactional
    public InventarioDTO actualizar(Long varianteId, Integer stockActual, Integer stockMinimo, String motivo) {
        Inventario inventario = inventarioRepository.findByVarianteId(varianteId)
                .orElseGet(() -> {
                    var variante = varianteRepository.findById(varianteId)
                            .orElseThrow(() -> new ResourceNotFoundException("ProductoVariante", varianteId));
                    return inventarioRepository.save(Inventario.builder()
                            .variante(variante)
                            .stockActual(0)
                            .stockReservado(0)
                            .stockMinimo(5)
                            .build());
                });

        int actual = inventario.getStockActual() != null ? inventario.getStockActual() : 0;
        int cantidadMovimiento = stockActual - actual;
        inventario.setStockActual(stockActual);
        if (stockMinimo != null) {
            inventario.setStockMinimo(stockMinimo);
        }
        inventarioRepository.save(inventario);

        // Registrar movimiento de forma transaccional
        movimientoRepository.save(MovimientoInventario.builder()
                .inventario(inventario)
                .tipo(cantidadMovimiento >= 0
                        ? MovimientoInventario.TipoMovimiento.ENTRADA
                        : MovimientoInventario.TipoMovimiento.SALIDA)
                .cantidad(Math.abs(cantidadMovimiento))
                .motivo(motivo != null ? motivo : "Ajuste manual")
                .build());

        return toDTO(inventario);
    }

    // ─── Movimientos ────────────────────────────────────────────────────────────

    /**
     * Lista movimientos activos (no archivados), con filtro opcional de fechas.
     */
    public List<com.eluxar.modules.inventario.dto.MovimientoInventarioDTO> listarMovimientos(
            LocalDate desde, LocalDate hasta) {

        if (desde == null && hasta == null) {
            return movimientoRepository.findByArchivadoFalseOrderByCreadoEnDesc()
                    .stream()
                    .map(this::toMovimientoDTO)
                    .toList();
        }

        LocalDateTime desdeDateTime = desde != null ? desde.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime hastaDateTime = hasta != null ? hasta.plusDays(1).atStartOfDay() : LocalDateTime.of(2100, 1, 1, 0, 0);

        return movimientoRepository.findByArchivadoFalseAndCreadoEnBetweenOrderByCreadoEnDesc(desdeDateTime, hastaDateTime)
                .stream()
                .map(this::toMovimientoDTO)
                .toList();
    }

    // ─── Exportación Excel ───────────────────────────────────────────────────────

    /**
     * Genera un archivo Excel (.xlsx) con todos los movimientos en el rango de fechas dado.
     * Incluye cabeceras estilizadas, una fila resumen y los totales de entradas y salidas.
     */
    public byte[] exportarMovimientosExcel(LocalDate desde, LocalDate hasta) throws Exception {
        List<MovimientoInventario> movimientos;
        
        if (desde == null && hasta == null) {
            movimientos = movimientoRepository.findAllByOrderByCreadoEnDesc();
        } else {
            LocalDateTime desdeDateTime = desde != null ? desde.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
            LocalDateTime hastaDateTime = hasta != null ? hasta.plusDays(1).atStartOfDay() : LocalDateTime.of(2100, 1, 1, 0, 0);
            movimientos = movimientoRepository.findByCreadoEnBetweenOrderByCreadoEnDesc(desdeDateTime, hastaDateTime);
        }

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Movimientos de Inventario");

            // ── Estilo de cabecera ──
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            // ── Estilo de entrada (verde) ──
            CellStyle entradaStyle = workbook.createCellStyle();
            entradaStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            entradaStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ── Estilo de salida (rojo) ──
            CellStyle salidaStyle = workbook.createCellStyle();
            salidaStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            salidaStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ── Fila de cabeceras ──
            String[] headers = {"ID", "Fecha", "Producto", "Variante (ml)", "Tipo", "Cantidad", "Motivo"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }
            sheet.setColumnWidth(2, 35 * 256); // Producto más ancho
            sheet.setColumnWidth(6, 50 * 256); // Motivo más ancho

            // ── Filas de datos ──
            int rowIdx = 1;
            int totalEntradas = 0;
            int totalSalidas = 0;

            for (MovimientoInventario m : movimientos) {
                Row row = sheet.createRow(rowIdx++);
                var variante = m.getInventario().getVariante();

                row.createCell(0).setCellValue(m.getId());
                row.createCell(1).setCellValue(m.getCreadoEn() != null ? m.getCreadoEn().format(DATE_FORMATTER) : "");
                row.createCell(2).setCellValue(variante.getProducto() != null ? variante.getProducto().getNombre() : "N/A");
                row.createCell(3).setCellValue(variante.getTamanoMl() + " ml");
                row.createCell(4).setCellValue(m.getTipo().name());
                row.createCell(5).setCellValue(m.getCantidad());
                row.createCell(6).setCellValue(m.getMotivo() != null ? m.getMotivo() : "");

                // Colorear filas por tipo
                CellStyle rowStyle = m.getTipo() == MovimientoInventario.TipoMovimiento.ENTRADA
                        ? entradaStyle : salidaStyle;
                for (int c = 0; c <= 6; c++) row.getCell(c).setCellStyle(rowStyle);

                if (m.getTipo() == MovimientoInventario.TipoMovimiento.ENTRADA) {
                    totalEntradas += m.getCantidad();
                } else {
                    totalSalidas += m.getCantidad();
                }
            }

            // ── Fila de totales ──
            Row totalRow = sheet.createRow(rowIdx + 1);
            CellStyle totalStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            totalStyle.setFont(boldFont);

            Cell labelCell = totalRow.createCell(4);
            labelCell.setCellValue("TOTALES");
            labelCell.setCellStyle(totalStyle);

            Cell entCell = totalRow.createCell(5);
            entCell.setCellValue("+" + totalEntradas + " / -" + totalSalidas);
            entCell.setCellStyle(totalStyle);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ─── Archivado ──────────────────────────────────────────────────────────────

    /**
     * Soft-delete masivo: archiva (oculta en vista) todos los movimientos
     * anteriores a la fecha dada sin eliminarlos físicamente de la base de datos.
     */
    @Transactional
    public void archivarMovimientosAnterioresA(LocalDate antes) {
        movimientoRepository.archivarAnterioresA(antes.atStartOfDay());
    }

    // ─── Alertas ────────────────────────────────────────────────────────────────

    public List<com.eluxar.modules.inventario.dto.AlertaStockDTO> obtenerAlertasStock() {
        return inventarioRepository.findAll().stream()
                .filter(inv -> inv.getStockActual() <= inv.getStockMinimo())
                .map(inv -> com.eluxar.modules.inventario.dto.AlertaStockDTO.builder()
                        .varianteId(inv.getVariante().getId())
                        .sku(inv.getVariante().getSku())
                        .productoNombre(inv.getVariante().getProducto() != null ? inv.getVariante().getProducto().getNombre() : null)
                        .tamanoMl(inv.getVariante().getTamanoMl())
                        .stockActual(inv.getStockActual())
                        .stockMinimo(inv.getStockMinimo())
                        .build())
                .toList();
    }

    // ─── Mappers privados ────────────────────────────────────────────────────────

    private InventarioDTO toDTO(Inventario inv) {
        var variante = inv.getVariante();
        int actual = inv.getStockActual() != null ? inv.getStockActual() : 0;
        int minimo = inv.getStockMinimo() != null ? inv.getStockMinimo() : 5;

        return InventarioDTO.builder()
                .id(inv.getId())
                .varianteId(variante.getId())
                .sku(variante.getSku())
                .productoNombre(variante.getProducto() != null ? variante.getProducto().getNombre() : null)
                .tamanoMl(variante.getTamanoMl())
                .stockActual(actual)
                .stockReservado(inv.getStockReservado() != null ? inv.getStockReservado() : 0)
                .stockMinimo(minimo)
                .stockBajo(actual <= minimo)
                .build();
    }

    private com.eluxar.modules.inventario.dto.MovimientoInventarioDTO toMovimientoDTO(MovimientoInventario mov) {
        var inv = mov.getInventario();
        var variante = inv != null ? inv.getVariante() : null;
        var producto = variante != null ? variante.getProducto() : null;

        return com.eluxar.modules.inventario.dto.MovimientoInventarioDTO.builder()
                .id(mov.getId())
                .varianteId(variante != null ? variante.getId() : 0L)
                .productoNombre(producto != null ? producto.getNombre() : "N/A")
                .tamanoMl(variante != null ? variante.getTamanoMl() + "ml" : "N/A")
                .tipo(mov.getTipo())
                .cantidad(mov.getCantidad())
                .motivo(mov.getMotivo())
                .fecha(mov.getCreadoEn())
                .usuario("Admin")
                .build();
    }
}
