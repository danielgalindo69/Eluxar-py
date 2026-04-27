package com.eluxar.modules.ia.service;

import com.eluxar.modules.catalogo.entity.Producto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PromptBuilder {

    public String buildPrompt(String userMessage, List<Producto> productos) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Eres un experto asesor de fragancias de la tienda Eluxar. ");
        prompt.append("Tu objetivo es recomendar los mejores perfumes basándote en la solicitud del usuario.\n\n");
        prompt.append("Solicitud del usuario: \"").append(userMessage).append("\"\n\n");
        prompt.append("Catálogo de productos disponibles:\n");
        
        for (Producto p : productos) {
            String familia = p.getFamiliaOlfativa() != null ? p.getFamiliaOlfativa().getNombre() : "No especificada";
            prompt.append("- Nombre: ").append(p.getNombre())
                  .append(" | Familia Olfativa: ").append(familia)
                  .append(" | Descripción/Notas: ").append(p.getDescripcion())
                  .append("\n");
        }
        
        prompt.append("\nINSTRUCCIONES CRÍTICAS:\n");
        prompt.append("1. Actúa como un experto asesor de fragancias muy amigable, cálido y conversacional.\n");
        prompt.append("2. Si el usuario solo saluda o no pide explícitamente una recomendación, respóndele amigablemente preguntando en qué puedes ayudarle y deja la lista de 'recomendaciones' VACÍA ([]).\n");
        prompt.append("3. SOLO si el usuario pide una sugerencia o busca una fragancia, selecciona un máximo de 3 perfumes del catálogo proporcionado que mejor se adapten.\n");
        prompt.append("4. NO recomiendes perfumes que no estén en la lista de arriba.\n");
        prompt.append("5. Responde ÚNICAMENTE con un objeto JSON válido, con la siguiente estructura exacta y sin formato markdown:\n");
        prompt.append("{\n");
        prompt.append("  \"mensaje\": \"(Tu respuesta conversacional y empática dirigida directamente al usuario, introduciendo las recomendaciones sin mencionar que hiciste un análisis interno)\",\n");
        prompt.append("  \"recomendaciones\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"nombre\": \"(nombre exacto del producto de la lista)\",\n");
        prompt.append("      \"motivo\": \"(por qué lo recomiendas para este usuario, con un tono persuasivo y amigable)\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    public String buildTestQuestionsPrompt() {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un experto perfumista y psicólogo de aromas.\n");
        prompt.append("Tu tarea es crear un test olfativo dinámico de exactamente 5 preguntas para descubrir la fragancia ideal de un cliente.\n");
        prompt.append("Haz preguntas creativas sobre su estilo de vida, personalidad, ambientes preferidos, o percepciones sensoriales.\n");
        prompt.append("Cada pregunta debe tener exactamente 4 opciones de respuesta.\n");
        prompt.append("Responde ÚNICAMENTE con un array JSON válido, con la siguiente estructura exacta y sin formato markdown:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"id\": 1,\n");
        prompt.append("    \"question\": \"(pregunta)\",\n");
        prompt.append("    \"options\": [\"(opción 1)\", \"(opción 2)\", \"(opción 3)\", \"(opción 4)\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        return prompt.toString();
    }

    public String buildTestAnalysisPrompt(java.util.Map<Integer, String> answers, List<Producto> productos) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un experto perfumista. Analiza las siguientes respuestas de un test olfativo de un cliente:\n\n");
        
        for (java.util.Map.Entry<Integer, String> entry : answers.entrySet()) {
            prompt.append("Pregunta ").append(entry.getKey()).append(": Respuesta elegida: ").append(entry.getValue()).append("\n");
        }
        
        prompt.append("\nCatálogo de productos disponibles:\n");
        for (Producto p : productos) {
            String familia = p.getFamiliaOlfativa() != null ? p.getFamiliaOlfativa().getNombre() : "No especificada";
            prompt.append("- ID: ").append(p.getId())
                  .append(" | Nombre: ").append(p.getNombre())
                  .append(" | Familia Olfativa: ").append(familia)
                  .append(" | Descripción/Notas: ").append(p.getDescripcion())
                  .append("\n");
        }
        
        prompt.append("\nINSTRUCCIONES CRÍTICAS:\n");
        prompt.append("1. Selecciona un máximo de 3 perfumes del catálogo que mejor encajen con el perfil del usuario según sus respuestas.\n");
        prompt.append("2. NO recomiendes perfumes que no estén en la lista.\n");
        prompt.append("3. Responde ÚNICAMENTE con un objeto JSON válido, con la siguiente estructura exacta y sin formato markdown:\n");
        prompt.append("{\n");
        prompt.append("  \"recommendedProductIds\": [\"(ID del producto 1 como texto)\", \"(ID del producto 2 como texto)\"]\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
}
