package com.eluxar.modules.ia.dto;

public class RecomendacionRequest {
    private Integer productId;
    private String respuestaTexto;

    public RecomendacionRequest() {}

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getRespuestaTexto() { return respuestaTexto; }
    public void setRespuestaTexto(String respuestaTexto) { this.respuestaTexto = respuestaTexto; }
}
