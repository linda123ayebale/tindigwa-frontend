package org.example.Repositories;


import org.example.Entities.ClientsProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientProfileRepository extends JpaRepository <ClientsProfile,Long>{

    Optional<ClientsProfile> findByNationalIdNumber(String aLong);
}
