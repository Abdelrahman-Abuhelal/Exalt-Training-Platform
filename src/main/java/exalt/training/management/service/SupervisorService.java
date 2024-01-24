package exalt.training.management.service;

import exalt.training.management.model.Supervisor;
import exalt.training.management.model.Trainee;
import exalt.training.management.repository.SupervisorRepository;
import exalt.training.management.repository.TraineeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupervisorService {

    private final SupervisorRepository supervisorRepository;


    public void saveSupervisor(Supervisor supervisor){
        supervisorRepository.save(supervisor);
    }
}
