package alumnos_api.curso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoResponseDto {

    private Long curId;
    private String curNom;
    private String curDesc;
    private Integer curCreditos;
    private Integer cantidadEstudiantes;
}
