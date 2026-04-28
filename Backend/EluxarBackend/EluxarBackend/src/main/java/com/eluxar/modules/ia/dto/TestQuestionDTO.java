package com.eluxar.modules.ia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestQuestionDTO {
    private Integer id;
    private String question;
    private List<String> options;
}
