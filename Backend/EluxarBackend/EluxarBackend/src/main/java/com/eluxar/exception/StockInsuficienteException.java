package com.eluxar.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(String message) {
        super(message);
    }

    public StockInsuficienteException(Long varianteId, int stockDisponible, int cantidadSolicitada) {
        super("Stock insuficiente para variante " + varianteId +
              ". Disponible: " + stockDisponible + ", Solicitado: " + cantidadSolicitada);
    }
}
