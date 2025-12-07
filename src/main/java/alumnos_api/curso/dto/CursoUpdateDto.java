package alumnos_api.curso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoUpdateDto {

    private String curNom;
    private String curDesc;
    private Integer curCreditos;
}
