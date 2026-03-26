package com.wyshmate.api.controller;

import com.wyshmate.api.entity.Board;
import com.wyshmate.api.entity.Message;
import com.wyshmate.api.repository.BoardRepository;
import com.wyshmate.api.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/boards")
@CrossOrigin(origins = "*") // For development, allow all origins
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody CreateBoardRequest request) {
        String adminToken = UUID.randomUUID().toString();
        Board board = new Board(request.getTitle(), request.getOccasion(), request.getRecipientName(), adminToken);
        board = boardRepository.save(board);
        return ResponseEntity.ok(board);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable UUID id) {
        Optional<Board> board = boardRepository.findById(id);
        return board.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<Message> addMessage(@PathVariable UUID id, @RequestBody CreateMessageRequest request) {
        Optional<Board> boardOpt = boardRepository.findById(id);
        if (boardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Message message = new Message(boardOpt.get(), request.getAuthorName(), request.getContent());
        message = messageRepository.save(message);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable UUID id) {
        List<Message> messages = messageRepository.findByBoardId(id);
        return ResponseEntity.ok(messages);
    }

    // Request DTOs
    public static class CreateBoardRequest {
        private String title;
        private String occasion;
        private String recipientName;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getOccasion() { return occasion; }
        public void setOccasion(String occasion) { this.occasion = occasion; }
        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    }

    public static class CreateMessageRequest {
        private String authorName;
        private String content;

        // Getters and setters
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}