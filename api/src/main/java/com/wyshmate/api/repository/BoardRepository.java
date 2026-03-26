package com.wyshmate.api.repository;

import com.wyshmate.api.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {
}