package alumnos_api.alumno.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumnoResponseDto {

    private String estCed;
    private String estNom;
    private String estApe;
    private String estDir;
    private String estTel;
    private Long cursoId;
    private String cursoNombre;
    private Integer cursoCreditos;
}
