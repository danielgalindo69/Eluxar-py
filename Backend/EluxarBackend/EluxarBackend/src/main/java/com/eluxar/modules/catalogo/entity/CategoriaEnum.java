package com.eluxar.modules.catalogo.entity;

/**
 * Enum de categorías fijas de productos Eluxar.
 * Los valores se almacenan como String en la base de datos.
 * El frontend muestra versiones con tildes: NINO=Niño, NINA=Niña.
 */
public enum CategoriaEnum {
    CABALLERO,
    DAMA,
    NINO,   // Niño - Java no soporta ñ en identificadores de enum
    NINA    // Niña
}
